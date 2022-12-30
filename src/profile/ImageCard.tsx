import { getDownloadURL, listAll, ref } from "firebase/storage";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import * as firebase from "../firebase";

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

export const ImageCard: FC = (props) => {
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        // Create a reference under which you want to list
        const listRef = ref(firebase.storage, "/Headshot Slideshow");

        // Find all the prefixes and items.
        listAll(listRef)
            .then((res) => {
                Promise.all(
                    res.items.map((itemRef) => getDownloadURL(itemRef))
                ).then((items) => setImages(items));
            })
            .catch((error) => console.error(error))
            .catch((error) => console.error(error));
    }, []);

    return (
        <BorderDiv className="card">
            <HeadshotImg src={images[0]} alt={images[0]}></HeadshotImg>
        </BorderDiv>
    );
};
