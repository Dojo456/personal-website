import { FC } from "react";
import styled from "styled-components";

export type Experience = {
    org?: string;
    title: string;
    startDate: Date;
    endDate: Date;
    link?: string;
};

interface ExperienceDisplayProps {
    experience: Experience;
}

const MainDiv = styled.div`
    width: 200px;
    border: 1px black solid;
    background-color: white;
    margin: 10px;
    height: min-content;
    > * {
        margin: 0px;
    }
`;

function DateToString(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
    }).format(date);
}

export const ExperienceDisplay: FC<ExperienceDisplayProps> = (props) => {
    const experience = props.experience;

    return (
        <a href={experience.link}>
            <MainDiv>
                <h1>
                    {DateToString(experience.startDate) +
                        " - " +
                        DateToString(experience.endDate)}
                </h1>
                <h2>{experience.title}</h2>
                <p>{experience.org}</p>
            </MainDiv>
        </a>
    );
};
