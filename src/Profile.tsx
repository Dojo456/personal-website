import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
const headshot = require("./Headshot.jpg");

const DisplayDiv = styled.div<{
    overflow: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex-direction: ${(props) => (props.overflow ? "column" : "row")};
`;

const HeadshotImg = styled.img`
    left: 0;
    margin: 30px;
    width: 400px;
    height: 400px;
    border: medium solid black;
`;

const TextDiv = styled.div`
    padding: 10px;
`;

const MainText = styled.h1`
    text-transform: uppercase;
    font-size: 60px;
    margin-bottom: 0px;
    margin-top: 0px;
    min-width: 300px;
    max-width: 100%;
`;

const HighlightedText = styled.code`
    font-size: 120%;
    color: white;
`;

const SubText = styled.p`
    font-size: larger;
    max-width: 650px;
    margin-bottom: 0px;
    margin-top: 0px;
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
            <TextDiv>
                <MainText ref={textRef}>
                    Hi. I'm <HighlightedText>Daniel</HighlightedText>
                </MainText>
                <SubText>
                    I'm a student at{" "}
                    <HighlightedText>Babson College</HighlightedText> studying
                    Business Administration sdfsdfs sdfsfdds sdfsdf
                </SubText>
            </TextDiv>
            <HeadshotImg src={headshot} alt="headshot"></HeadshotImg>
        </DisplayDiv>
    );
};
