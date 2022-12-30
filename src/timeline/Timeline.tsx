import { collection, getDocs } from "firebase/firestore";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import * as firebase from "../firebase";
import { Experience, ExperienceDisplay } from "./Experience";

const DisplayDiv = styled.div`
    display: flex;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
`;

export const Timeline: FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);

    useEffect(() => {
        getDocs(collection(firebase.firestore, "experiences"))
            .then((querySnapshot) => {
                const allExperiences = querySnapshot.docs.map(
                    (snapshot) => snapshot.data() as Experience
                );

                allExperiences.sort(
                    (a, b) => b.endDate.getTime() - a.endDate.getTime()
                );

                setExperiences(allExperiences);
            })
            .catch((reason) => console.error(reason));
    }, []);

    console.log(experiences);

    return (
        <DisplayDiv>
            {experiences.map((experience) => (
                <ExperienceDisplay experience={experience}></ExperienceDisplay>
            ))}
        </DisplayDiv>
    );
};
