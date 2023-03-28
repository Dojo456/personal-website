import { collection, getDocs } from "firebase/firestore";
import * as firebase from "../firebase";

export enum ExperienceType {
    Programming = "Programming",
    Work = "Work",
    Education = "Education",
}

const AllExperienceTypes: ExperienceType[] = [];
for (let value in ExperienceType) {
    AllExperienceTypes.push(
        ExperienceType[value as keyof typeof ExperienceType]
    );
}

export function ExperienceTypes() {
    return AllExperienceTypes;
}

export type Experience = {
    type: ExperienceType;
    org: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
};

const firestoreAsExperience = (data: any) => {
    const exp = data as Experience;

    exp.startDate = data.startDate.toDate();

    if (data.endDate) {
        exp.endDate = data.endDate.toDate();
    }

    return exp;
};

export class ExperienceFetcher {
    cachedExperiences: { [key in ExperienceType]?: Experience[] };

    constructor() {
        this.cachedExperiences = {};
    }

    async getExperiences(type: ExperienceType): Promise<Experience[]> {
        const cached = this.cachedExperiences[type];

        if (cached && cached?.length !== 0) {
            return cached;
        }

        let experiences: Experience[] = [];

        switch (type) {
            case ExperienceType.Work:
                experiences = await this.getWork();
                break;
            case ExperienceType.Programming:
                experiences = await this.getGitHub();
                break;
            case ExperienceType.Education:
                experiences = await this.getEducation();
                break;
        }

        experiences.sort((a, b) => {
            if (!b.endDate) {
                return 1;
            } else if (!a.endDate) {
                return -1;
            }

            return b.endDate.getTime() - a.endDate.getTime();
        });

        this.cachedExperiences[type] = experiences;

        return experiences;
    }

    private async getWork(): Promise<Experience[]> {
        const querySnapshot = await getDocs(
            collection(firebase.firestore, "experiences")
        );

        const allExperiences = querySnapshot.docs.map((snapshot) =>
            firestoreAsExperience(snapshot.data())
        );

        return allExperiences;
    }

    private async getGitHub(): Promise<Experience[]> {
        const resp = await fetch("https://api.github.com/users/Dojo456/repos");

        const data = (await resp.json()) as any[];

        const experiences: Experience[] = [];
        for (let repo of data) {
            experiences.push({
                type: ExperienceType.Programming,
                org: repo.name,
                title: "",
                description: "",
                startDate: new Date(repo.created_at),
                endDate: new Date(repo.updated_at),
            });
        }

        return experiences;
    }

    private async getEducation(): Promise<Experience[]> {
        const querySnapshot = await getDocs(
            collection(firebase.firestore, "education")
        );

        const allExperiences = querySnapshot.docs.map((snapshot) =>
            firestoreAsExperience(snapshot.data())
        );

        return allExperiences;
    }
}
