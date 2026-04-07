import { CheckCircle2 } from "lucide-react";
import styled from "styled-components";
import { pricingOptions } from "../constants";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <StyledWrapper>

    <div className="pricing m-0 p-12 bg-black text-white rounded-lg">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-8 tracking-wide">
        Pricing
      </h2>
      <div className="flex flex-wrap">
        {pricingOptions.map((option, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-2">
            <div className="p-10 border border-neutral-700 rounded-xl">
              <p className="text-4xl mb-8">
                {option.title}
                {option.title === "Pro" && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-400 text-transparent bg-clip-text text-xl mb-4 ml-2">
                    (Most Popular)
                  </span>
                )}
              </p>
              <p className="mb-8">
                <span className="text-5xl mt-6 mr-2">{option.price}</span>
                <span className="text-neutral-400 tracking-tight">/Month</span>
              </p>
              <ul>
                {option.features.map((feature, index) => (
                  <li key={index} className="mt-8 flex items-center">
                    <CheckCircle2 />
                    <span className="ml-2">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                href="#"
                onClick={()=> navigate("/video")}

                className="inline-flex justify-center items-center text-center w-full h-12 p-5 mt-20 tracking-tight text-xl hover:bg-orange-900 border border-orange-900 rounded-lg transition duration-200"
              >
                Subscribe
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`
.pricing{
width: 100%;
height: 100%;
background-image: radial-gradient(rgba(244, 244, 244, 0.35) 5%, transparent 5%),
                  radial-gradient(rgba(244, 244, 244, 0.35) 5%, transparent 5%);
background-size: 20px 20px; 
background-position: 0 0, 10px 10px; 


}

`
export default Pricing;
