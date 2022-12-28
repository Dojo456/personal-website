import styled from "styled-components";
import "./App.css";
import { Profile } from "./Profile";

const StyledApp = styled.div`
    background-color: teal;
`;

function App() {
    return (
        <StyledApp>
            <Profile></Profile>
        </StyledApp>
    );
}

export default App;
