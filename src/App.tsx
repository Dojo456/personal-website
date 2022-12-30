import styled from "styled-components";
import "./App.css";
import { Profile } from "./profile/Profile";
import { Timeline } from "./timeline/Timeline";

const ScrollApp = styled.article`
    background-color: teal;
    overflow-y: scroll;
    height: 100vh;
    scroll-snap-type: y mandatory;
`;

const ScrollSection = styled.section`
    scroll-snap-align: start;
    scroll-margin-bottom: 100px;
`;

function App() {
    return (
        <ScrollApp>
            <ScrollSection>
                <Profile></Profile>
            </ScrollSection>
            <ScrollSection>
                <Timeline></Timeline>
            </ScrollSection>
        </ScrollApp>
    );
}

export default App;
