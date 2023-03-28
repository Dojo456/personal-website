import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { Experience, ExperienceFetcher, ExperienceType } from "./Experience";
import { ExperienceList } from "./ExperienceList";
import { ExperienceTypeSelector } from "./ExperienceTypeSelector";

const DisplayDiv = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    padding-top: 20px;
`;

const fetcher = new ExperienceFetcher();

export const Timeline: FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [selectedType, setSelectedType] = useState(ExperienceType.Work);

    useEffect(() => {
        fetcher
            .getExperiences(selectedType)
            .then((value) => setExperiences(value))
            .catch((err) => console.error(err));
    }, [selectedType]);

    console.log(experiences);

    return (
        <DisplayDiv>
            <ExperienceTypeSelector
                selected={selectedType}
                onChange={(type) => {
                    setSelectedType(type);
                }}
            ></ExperienceTypeSelector>
            <ExperienceList experiences={experiences}></ExperienceList>
        </DisplayDiv>
    );
};
