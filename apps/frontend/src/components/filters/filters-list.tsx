import FilterPlantCategory from "./filter-plant-category";
export default function FiltersList() {
  const types = ["Shrub", "Tree", "Grass", "Other"]
  return (
    <div className="p-4 bg-secondary rounded shadow-md z-12 overflow-y-auto border border-gray-300">
      <h2>
        Filter
      </h2>
      <div className="max-h-[200px] overflow-y-auto">
      {types.map((type) => (
        <FilterPlantCategory key={type} filterCategory={type} />
      ))}
      <div>
        <h3>Soil</h3>
        <ul>
          <li>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="soil1"
                className="mr-2"
              />
              <label htmlFor="soil1">Soil 1</label>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="soil2"
                className="mr-2"
              />
              <label htmlFor="soil2">Soil 2</label>
            </div>
          </li>
          </ul>
      </div>
      </div>
    </div>
  );
}