import { FC } from "react";
import styled from "styled-components";
import { HasShadows } from "../common/styles";
import { Experience } from "./Experience";

const BackgroundDiv = styled.div`
    width: 800px;
    height: 230px;

    position: relative;
`;

const DateDiv = styled.div`
    background-color: white;
    border: 2px black solid;
    width: 100px;
    height: min-content;
    text-align: center;

    // Positions
    position: absolute;
    top: 50%;
    margin-top: -75px;
    left: 50%;
    margin-left: -50px;

    // Text Styling
    font-size: large;
    font-weight: bold;
`;

const ContentsDiv = styled.span<{ alignRight: boolean }>`
    background-color: white;
    border: 2px black solid;
    width: 300px;
    height: 220px;
    padding: 10px;

    ${HasShadows}

    // centering
    position: absolute;
    top: 50%;
    margin-top: -100px; /* Half this element's height */

    // left right align
    left: ${(props) => (props.alignRight ? "500px" : "0px")};
`;

const OrgH2 = styled.h2`
    margin-top: 0px;
    margin-bottom: 0px;
`;

const TitleH1 = styled.h1`
    margin-top: 0px;
    margin-bottom: 0px;
    font-weight: normal;
    font-size: larger;
    font-style: italic;
`;

const DescriptionP = styled.p`
    font-size: large;
`;

interface ExperienceDisplayProps {
    experience: Experience;
    alignRight: boolean;
}

export const ExperienceDisplay: FC<ExperienceDisplayProps> = (props) => {
    console.log(props.alignRight);

    const date = props.experience.endDate;
    let dateString = "Current";
    if (date) {
        dateString =
            date.toLocaleString("default", { month: "short" }) +
            " " +
            date.getFullYear();
    }

    const exp = props.experience;

    return (
        <BackgroundDiv>
            <DateDiv>{dateString}</DateDiv>
            <ContentsDiv alignRight={props.alignRight}>
                <OrgH2>{exp.org}</OrgH2>
                <TitleH1>{exp.title}</TitleH1>
                <DescriptionP>{exp.description}</DescriptionP>
            </ContentsDiv>
        </BackgroundDiv>
    );
};
