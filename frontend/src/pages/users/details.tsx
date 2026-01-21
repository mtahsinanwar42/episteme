import { useParams } from "react-router-dom";

export default function UserDetails() {
  const { userId } = useParams();

  return <div>User Details Page for user ID: {userId}</div>;
}
