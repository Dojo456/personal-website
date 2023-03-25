import { FC } from "react";
import styled from "styled-components";
import { Experience } from "./Experience";
import { ExperienceDisplay } from "./ExperienceDisplay";

const LinedDiv = styled.div`
    background: linear-gradient(#000, #000) no-repeat center/3px 100%;
    width: 800px;
`;

interface ExperienceListProps {
    experiences: Experience[];
}

export const ExperienceList: FC<ExperienceListProps> = (props) => {
    const exps = [];

    for (let i = 0; i < 4; i++) {
        if (props.experiences.length !== 0) {
            exps.push(props.experiences[0]);
        }
    }

    return (
        <LinedDiv>
            {exps.map((experience, idx) => (
                <ExperienceDisplay
                    alignRight={idx % 2 === 0}
                    experience={experience}
                    key={idx}
                ></ExperienceDisplay>
            ))}
        </LinedDiv>
    );
};
