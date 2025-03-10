import React from 'react';
import { PlantInformation } from "../../../types/observations";
interface PlantObservationProps {
  plantInfo: PlantInformation;
  editingButtons?: boolean;
}

const PlantObservation: React.FC<PlantObservationProps> = ({ plantInfo, editingButtons }) => {
  const {
    commonName,
    scientificName,
    native,
    dateBloomed,
    datePlanted,
    quantity,
    soilType,
  } = plantInfo;

  return (
    <div className='flex flex-row'>

      <div>
        {
          editingButtons && (
            <div className='flex flex-col gap-2'>
              <button className='bg-blue-500 text-white px-4 py-2 rounded'>Edit</button>
              <button className='bg-red-500 text-white px-4 py-2 rounded'>Delete</button>
            </div>
          )
        }

      </div>
      <div>
        <div className='flex flex-row items-center gap-2 pl-2'>
          <h3>
            {commonName}
          </h3>
          {scientificName && <h3>({scientificName})</h3>}
        </div>
        <div className='flex flex-col pl-5'>
          {native !== undefined && <p>- Native: {native ? "Yes" : "No"}</p>}
          {dateBloomed && <p>- Date Bloomed: {dateBloomed.toLocaleDateString()}</p>}
          {datePlanted && <p>- Date Planted: {datePlanted.toLocaleDateString()}</p>}
          {quantity !== undefined && <p>- Quantity: {quantity}</p>}
          {soilType && <p>- Soil Type: {soilType}</p>}
        </div>
      </div>


    </div>
  );
};

export default PlantObservation;
