import { FC } from "react";
import styled from "styled-components";
const headshot = require("./Headshot.jpg");

const BaseDiv = styled.div`
    display: flex;
    justify-content: center;
`;

const DisplayDiv = styled.div`
    width: 70%;
    height: 70%;
    display: flex;
    flex-direction: row;
    background-color: slategrey;
`;

const ImageDiv = styled.div`
    background-color: white;
`;

const HeadshotImg = styled.img`
    left: 0;
    margin: 30px;
    width: 400px;
    height: auto;
    border: medium solid black;
`;

const TextSpan = styled.div`
    padding-left: 30px;
    padding-right: 30px;
`;

export const Profile: FC = () => {
    return (
        <BaseDiv>
            <DisplayDiv>
                <ImageDiv>
                    <HeadshotImg src={headshot} alt="headshot"></HeadshotImg>
                </ImageDiv>
                <TextSpan>
                    <h1>Daniel Liao</h1>
                    <p>
                        This is a bio fffffffffffffffffffffffffffff
                        ffffffffffffffffffffffffffsadf
                        sdffffffffffffffffffffffffffffffff ffffffffffffffffff
                        ffff f fffffffff ffffff ffffffffffffffffsadfsdfff
                        fffffff ffffffffff ffffffffffffffff fffffffff
                        fffffffffffffffffffffff ffffffffffffffffffsadfsd
                        fffffffffffffffffff ffffffffffffff ffffffffffff
                        ffffffffffffff fffffffff
                        ffffffffffffffffffsadfsdfffffffffffffffffffffffffffffff
                        ffffffffffffffff fffffffffffffffffff fffffffff
                        fffffffffff
                    </p>
                </TextSpan>
            </DisplayDiv>
        </BaseDiv>
    );
};
