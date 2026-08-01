import Main from './components/Main/Main';
import { ReviewProvider } from './context/ReviewContext';

const App = (): JSX.Element => (
  <ReviewProvider>
    <Main />
  </ReviewProvider>
);

export default App;
