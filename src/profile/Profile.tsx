import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ImageCard } from "./ImageCard";
import { SocialDisplays } from "./SocialsDisplay";

const DisplayDiv = styled.div<{
    overflow: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
    flex-direction: ${(props) => (props.overflow ? "column" : "row")};
`;

const TextDiv = styled.div`
    padding: 10px;
    margin: 10px;
    background-color: white;
`;

const MainText = styled.h1`
    text-transform: uppercase;
    font-size: 60px;
    margin-bottom: 0px;
    margin-top: 0px;
    min-width: 300px;
    max-width: 100%;
`;

const HighlightedText = styled.span<{
    color?: string;
}>`
    font-size: 110%;
    color: ${(props) => (props.color ? props.color : undefined)};
    font-family: "Lucida Console", "Courier New", monospace;
    font-weight: bolder;
    text-transform: uppercase;
`;

const SubText = styled.p`
    font-size: larger;
    max-width: 650px;
    margin-bottom: 0px;
    font-weight: 500;
    margin-top: 0px;
`;

const SocialsDiv = styled.div`
    margin-top: 100px;
    display: flex;
    flex-direction: column;
`;

export const Profile: FC = () => {
    const [overflow, setOverflow] = useState(false);
    const textRef = useRef<HTMLHeadingElement>(null);

    const handleResize = () => {
        let newOverflow = false;

        if (textRef !== null) {
            if (textRef.current!.offsetWidth + 460 > window.innerWidth) {
                newOverflow = true;
            }
        }

        setOverflow(newOverflow);
    };

    useEffect(() => {
        window.addEventListener("resize", handleResize, false);
    });

    return (
        <DisplayDiv overflow={overflow}>
            <TextDiv className="card">
                <MainText ref={textRef}>
                    Hi. I'm{" "}
                    <HighlightedText color="#F6B222">Daniel</HighlightedText>
                </MainText>
                <SubText>
                    I'm a student at{" "}
                    <HighlightedText color="#679C41">
                        Babson College
                    </HighlightedText>{" "}
                    studying{" "}
                    <HighlightedText color="#CC2D29">
                        Business Administration
                    </HighlightedText>{" "}
                    with a passion in{" "}
                    <HighlightedText color="#2877A8">
                        Computer Science
                    </HighlightedText>
                </SubText>
                <SocialsDiv>
                    <SocialDisplays></SocialDisplays>
                </SocialsDiv>
            </TextDiv>
            <ImageCard></ImageCard>
        </DisplayDiv>
    );
};
