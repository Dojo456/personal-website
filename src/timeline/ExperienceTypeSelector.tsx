import { FC } from "react";
import styled from "styled-components";
import { HasShadows } from "../common/styles";
import { ExperienceType, ExperienceTypes } from "./Experience";

const ContainerDiv = styled.div`
    display: flex;
    flex-direction: row;
    border: 2px black solid;
    height: min-content;
    width: min-content;

    margin-bottom: 30px;

    ${HasShadows}
`;

const ExperienceButton = styled.button<{ selected: boolean }>`
    width: 150px;
    height: 50px;
    border: 1px black solid;
    background-color: ${(props) => (props.selected ? "#F6B222" : "white")};
    cursor: default;
    :hover {
        filter: brightness(${(props) => (props.selected ? "85%" : "60%")});
    }

    // Text styling
    font-size: large;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
`;

interface ExperienceTypeSelectorProps {
    selected: ExperienceType;
    onChange: (type: ExperienceType) => void;
}

export const ExperienceTypeSelector: FC<ExperienceTypeSelectorProps> = (
    props
) => {
    return (
        <ContainerDiv>
            {ExperienceTypes().map((val) => {
                return (
                    <ExperienceButton
                        selected={val === props.selected}
                        key={val}
                        onClick={() => {
                            props.onChange(val);
                        }}
                    >
                        {val}
                    </ExperienceButton>
                );
            })}
        </ContainerDiv>
    );
};
