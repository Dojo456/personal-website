import { FC } from "react";
import styled from "styled-components";

interface ImageCardProps {
    src: string;
    alt: string;
}

const BorderDiv = styled.div`
    background-color: white;
    width: 444px;
    height: 538px;
    margin: 10px;
`;

const HeadshotImg = styled.img`
    left: 0;
    margin-left: 22px;
    margin-top: 22px;
    width: 400px;
    height: 400px;
`;

export const ImageCard: FC<ImageCardProps> = (props) => {
    return (
        <BorderDiv className="card">
            <HeadshotImg src={props.src} alt={props.alt}></HeadshotImg>
        </BorderDiv>
    );
};
