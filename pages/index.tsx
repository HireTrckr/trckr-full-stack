import { JobList } from "../components/JobList/JobList";
import JobForm from "../components/JobForm/JobForm";
import Navbar from "../components/Navbar/Navbar";
import "../styles/globals.css";

/*TODO:
Router
i18n
NavBar
*/

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center space-y-6">
      <Navbar />
      <JobForm />
      <JobList />
    </div>
  );
}
