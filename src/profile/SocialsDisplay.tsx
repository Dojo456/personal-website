import { FC } from "react";
import { SocialIcon } from "react-social-icons";
import styled from "styled-components";

const SocialsHeader = styled.span`
    font-size: x-large;
    font-weight: bolder;
    margin-bottom: 10px;
`;

const SocialsList = styled.span`
    display: flex;
    flex-direction: row;
`;
const StyledSocialIcon = styled(SocialIcon)`
    margin-right: 20px;
`;

export const SocialDisplays: FC = () => {
    return (
        <>
            <SocialsHeader>Add My Socials:</SocialsHeader>
            <SocialsList>
                <StyledSocialIcon url="https://www.linkedin.com/in/daniel-liao-350a78202/"></StyledSocialIcon>
                <StyledSocialIcon url="https://github.com/Dojo456"></StyledSocialIcon>
                <StyledSocialIcon url="https://www.instagram.com/daniy_liao/"></StyledSocialIcon>
                <StyledSocialIcon url="https://open.spotify.com/user/3lmajr1ss2jg8g86cpfifdfxb?si=a45f2d346f804387"></StyledSocialIcon>
            </SocialsList>
        </>
    );
};
