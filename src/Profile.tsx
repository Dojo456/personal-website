import { FC, useEffect, useRef, useState } from "react";
import { SocialIcon } from "react-social-icons";
import styled from "styled-components";
const headshot = require("./Headshot.jpg");

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

const HighlightedText = styled.span`
    font-size: 110%;
    color: white;
    font-family: "Lucida Console", "Courier New", monospace;
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

const SocialsHeader = styled.span`
    font-size: x-large;
    font-weight: bolder;
    font-family: "Lucida Console", "Courier New", monospace;
    margin-bottom: 10px;
`;

const SocialsList = styled.span`
    display: flex;
    flex-direction: row;
`;

interface StyledSocialIconProps {
    url: string;
}

const InternalStyledIconDiv = styled.div`
    width: 52px;
    height: 52px;
    background-color: white;
    border-radius: 100%;
    margin-right: 20px;
`;

const InternalStyledIcon = styled(SocialIcon)`
    left: 1px;
    top: 1px;
`;

const StyledSocialIcon: FC<StyledSocialIconProps> = (props) => {
    return (
        <InternalStyledIconDiv>
            <InternalStyledIcon url={props.url}></InternalStyledIcon>
        </InternalStyledIconDiv>
    );
};

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
                    Business Administration with a passion in{" "}
                    <HighlightedText>Computer Science.</HighlightedText>
                </SubText>
                <SocialsDiv>
                    <SocialsHeader>Add My Socials:</SocialsHeader>
                    <SocialsList>
                        <StyledSocialIcon url="https://www.linkedin.com/in/daniel-liao-350a78202/"></StyledSocialIcon>
                        <StyledSocialIcon url="https://github.com/Dojo456"></StyledSocialIcon>
                        <StyledSocialIcon url="https://www.instagram.com/daniy_liao/"></StyledSocialIcon>
                    </SocialsList>
                </SocialsDiv>
            </TextDiv>
            <HeadshotImg src={headshot} alt="headshot"></HeadshotImg>
        </DisplayDiv>
    );
};
