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

export const asExperience = (data: any) => {
    const exp = data as Experience;

    exp.endDate = data.endDate.toDate();
    exp.startDate = data.startDate.toDate();

    return exp;
};

export class ExperienceFetcher {
    cachedExperiences: { [key in ExperienceType]?: Experience[] };

    constructor() {
        this.cachedExperiences = {};
    }

    async getExperiences(type: ExperienceType): Promise<Experience[]> {
        let experiences: Experience[] = [];

        switch (type) {
            case ExperienceType.Work:
                experiences = await this.getWork();
                break;
            case ExperienceType.Programming:
                experiences = await this.getGitHub();
                break;
        }

        return experiences;
    }

    private async getWork(): Promise<Experience[]> {
        const querySnapshot = await getDocs(
            collection(firebase.firestore, "experiences")
        );

        const allExperiences = querySnapshot.docs.map((snapshot) =>
            asExperience(snapshot.data())
        );

        allExperiences.sort(
            (a, b) => b.endDate.getTime() - a.endDate.getTime()
        );

        return allExperiences;
    }

    private async getGitHub(): Promise<Experience[]> {
        const resp = await fetch("https://api.github.com/users/schacon/repos");

        const data = await resp.json();

        console.log(data);

        return [];
    }
}
