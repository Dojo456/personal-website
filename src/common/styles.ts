import { css } from "styled-components";

export const HasShadows = css`
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    transition: 0.3s;
    &:hover {
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
    }
`;