import { collection, getDocs } from "firebase/firestore";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import * as firebase from "../firebase";
import { Experience, ExperienceDisplay } from "./Experience";

const DisplayDiv = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 50px;
    min-height: 100vh;
    width: 100%;
`;

const StyledLabel = styled.label``;

enum ExperienceType {
    Programming = "Programming",
    Education = "Education",
    Work = "Work",
}

type AllExperiences = {
    [key in ExperienceType]: Experience[];
};

export const Timeline: FC = () => {
    const [experiences, setExperiences] = useState<AllExperiences>();
    const [selected, setSelected] = useState<ExperienceType>(
        ExperienceType.Programming
    );

    console.log(experiences);

    const fetchAllExperiences = async () => {
        const fetchGitHub = async () => {
            const resp = await fetch(
                "https://api.github.com/users/Dojo456/repos"
            );
            const data = await resp.json();

            const repoExperiences: Experience[] = [];

            for (const repo of data) {
                repoExperiences.push(ParseRepo(repo));
            }

            return repoExperiences;
        };

        const fetchFirebase = async () => {
            const querySnapshot = await getDocs(
                collection(firebase.firestore, "experiences")
            );
            const allExperiences = querySnapshot.docs.map(
                (snapshot) => snapshot.data() as Experience
            );

            allExperiences.sort(
                (a, b) => b.endDate.getTime() - a.endDate.getTime()
            );

            return allExperiences;
        };

        return {
            Programming: await fetchGitHub(),
            Work: await fetchFirebase(),
            Education: [],
        };
    };

    useEffect(() => {
        fetchAllExperiences()
            .then((experiences) => {
                setExperiences(experiences);
            })
            .catch((err) => console.error(err));
    }, []);

    const onRadioButtonChange = (
        event: React.SyntheticEvent<HTMLInputElement, Event>
    ) => {
        setSelected(
            ExperienceType[
                event.currentTarget.value as keyof typeof ExperienceType
            ]
        );
    };

    return (
        <DisplayDiv>
            <form>
                {(
                    Object.keys(ExperienceType) as Array<
                        keyof typeof ExperienceType
                    >
                ).map((enumLabel, idx) => {
                    const key = enumLabel.valueOf();
                    return (
                        <StyledLabel htmlFor={key} key={idx * 2 + 1}>
                            <input
                                type="radio"
                                name="experienceType"
                                value={key}
                                key={idx * 2}
                                onChange={onRadioButtonChange}
                                checked={key === selected}
                            ></input>
                            {key}
                        </StyledLabel>
                    );
                })}
            </form>
            <div>
                {experiences
                    ? experiences[selected].map((experience, idx) => (
                          <ExperienceDisplay
                              key={idx}
                              experience={experience}
                          ></ExperienceDisplay>
                      ))
                    : undefined}
            </div>
        </DisplayDiv>
    );
};

function ParseRepo(repo: any): Experience {
    return {
        title: repo.name,
        startDate: new Date(repo.created_at),
        endDate: new Date(repo.updated_at),
    };
}
