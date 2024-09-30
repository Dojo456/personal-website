import { getDownloadURL, listAll, ref } from "firebase/storage";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { HasShadows } from "../common/styles";
import * as firebase from "../firebase";

const BorderDiv = styled.div`
    background-color: white;
    max-width: min(90vh, 444px);
    aspect-ratio: 0.82527881;
    margin: 10px;
    ${HasShadows}
`;

const HeadshotImg = styled.img`
    left: 0;
    margin-left: 5%;
    margin-top: 5%;
    width: 90%;
    height: 74%;
`;

const SlideshowDotsDiv = styled.div`
    text-align: center;
`;

interface SlideshowDotProps {
    selected: boolean;
}

const SlideshowDot = styled.div<SlideshowDotProps>`
    display: inline-block;
    height: 10px;
    width: 10px;
    border-radius: 50%;
    cursor: pointer;
    margin: 15px 7px 0px;
    background-color: ${(props) => (props.selected ? "#444444" : "#c4c4c4")};
`;

export const ImageCard: FC = (props) => {
    const [images, setImages] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // Create a reference under which you want to list
        const listRef = ref(firebase.storage, "/Headshot Slideshow");

        const loadImages = async () => {
            const listResult = await listAll(listRef);

            const allImages = await Promise.all(
                listResult.items.map((item) => getDownloadURL(item))
            );
            setImages(allImages);
        };

        loadImages().catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        const maxIndex = images.length - 1;

        const timeoutHandle = setTimeout(() => {
            setIndex((prevIndex) => {
                return prevIndex === maxIndex ? 0 : prevIndex + 1;
            });
        }, 6000);

        return () => {
            window.clearTimeout(timeoutHandle);
        };
    }, [images, index]);

    return (
        <BorderDiv className="card">
            <HeadshotImg src={images[index]} alt={images[index]}></HeadshotImg>
            <SlideshowDotsDiv>
                {images.map((_, idx) => (
                    <SlideshowDot
                        key={idx}
                        selected={idx === index}
                        onClick={() => setIndex(idx)}
                    ></SlideshowDot>
                ))}
            </SlideshowDotsDiv>
        </BorderDiv>
    );
};
