import { useParams } from 'react-router-dom';
import CreatePoll from './CreatePoll';
import ParticipantPoll from './ParticipantPoll';

function FindTime() {
  const { shareCode } = useParams();

  // If there's a shareCode, show participant view, otherwise show create view
  if (shareCode) {
    return <ParticipantPoll />;
  } else {
    return <CreatePoll />;
  }
}

export default FindTime;