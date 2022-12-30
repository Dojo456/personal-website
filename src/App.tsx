import styled from "styled-components";
import "./App.css";
import { Profile } from "./profile/Profile";
import { Timeline } from "./timeline/Timeline";

const StyledApp = styled.div`
    background-color: teal;
`;

function App() {
    return (
        <StyledApp>
            <Profile></Profile>
            <Timeline></Timeline>
        </StyledApp>
    );
}

export default App;
