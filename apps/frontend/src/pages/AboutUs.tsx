import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="mb-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Mission Statement</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          The Mission of the Clark Street Beach Bird Sanctuary is to provide a habitat for migratory birds.
          The purpose of the website is to allow for a centralized way of recordkeeping of plants in the habitat.
          Observations, trends, and experiments can be tracked with a grid-based map system that allows intuitive access and reporting of plant data.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/map" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
          <h2 className="text-lg  font-semibold mb-3">Launch Map</h2>
          <p className="text-gray-600">
            Explore our interactive map to view plant locations and detailed information about different patches.
          </p>
        </Link>

        <Link to="/spreadsheet" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
          <h2 className="text-lg font-semibold mb-3">View Spreadsheet</h2>
          <p className="text-gray-600">
            Access our comprehensive plant database in a spreadsheet format for detailed analysis.
          </p>
        </Link>

        <Link to="/docs" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-primary-green">
          <h2 className="text-lg font-semibold mb-3">Explore Documentation</h2>
          <p className="text-gray-600">
            Figure out how to explore the website and look at FAQs.
          </p>
        </Link>
      </div>
    </div>
  );
}