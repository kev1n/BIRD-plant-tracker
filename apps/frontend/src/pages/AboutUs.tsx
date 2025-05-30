import { Link } from 'react-router-dom';

const DOCUMENTATION_BASE_URL = "https://docusaurus-gilt-theta.vercel.app/docs/";

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      
      {/* Mission Statement */}
      <div className="p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Mission Statement</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          The Clark Street Beach Bird Sanctuary aims to provide a habitat for migratory birds.
          This website is a centralized way of recordkeeping of plants in the habitat.
          Observations, trends, and experiments can be tracked with a grid-based map and spreadsheet system that allows intuitive access and reporting of plant data.
        </p>
      </div>
      
      {/* Main Features */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/map" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
          <h2 className="text-lg font-semibold mb-3">Launch Map</h2>
          <p className="text-gray-600">
            Click to explore our interactive map to view plant locations and detailed information about different patches
          </p>
        </Link>

        <Link to="/spreadsheet" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
          <h2 className="text-lg font-semibold mb-3">View Spreadsheet</h2>
          <p className="text-gray-600">
            Click to look into plant information and location through a spreadsheet format for more detailed and concise data viewing
          </p>
        </Link>
      </div>

      {/* Documentation Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold px-4">Documentation: Click Each Box to Learn More</h2>
        
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          <Link to={DOCUMENTATION_BASE_URL + "frontend-guide"} className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
            <h3 className="text-lg font-semibold mb-3">Navigation Guide</h3>
            <p className="text-gray-600">
              Start here for a quick overview and basic navigating through the website
            </p>
          </Link>

          <Link to={DOCUMENTATION_BASE_URL + "frontend-guide/map-view"} className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
            <h3 className="text-lg font-semibold mb-3">Map Guide</h3>
            <p className="text-gray-600">
              Learn how to use the interactive map features
            </p>
          </Link>

          <Link to={DOCUMENTATION_BASE_URL + "frontend-guide/spreadsheet"} className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
            <h3 className="text-lg font-semibold mb-3">Spreadsheet Guide</h3>
            <p className="text-gray-600">
              Learn how to use the spreadsheet of plants
            </p>
          </Link>

          <Link to={DOCUMENTATION_BASE_URL + "frontend-guide/admin"} className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
            <h3 className="text-lg font-semibold mb-3">Permissions for Various Roles</h3>
            <p className="text-gray-600">
              Understand how different users on the website can interact with it
            </p>
          </Link>

          <Link to={DOCUMENTATION_BASE_URL + "faq"} className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
            <h3 className="text-lg font-semibold mb-3">FAQ</h3>
            <p className="text-gray-600">
              Frequently asked questions
            </p>
          </Link>
        </div>
      </div>   
    </div>
  );
}