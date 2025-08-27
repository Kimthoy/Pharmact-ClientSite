import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import { Link } from "react-router-dom"; // ⬅️ Import Link
import "keen-slider/keen-slider.min.css";

const ProductsSlider = ({ products }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, slider] = useKeenSlider(
    {
      loop: true,
      mode: "snap",
      slides: {
        perView: 1.2,
        spacing: 15,
        breakpoints: {
          "(min-width: 640px)": { perView: 2.2 },
          "(min-width: 768px)": { perView: 3 },
          "(min-width: 1024px)": { perView: 4 },
        },
      },
      slideChanged(s) {
        setCurrentSlide(s.track.details.rel);
      },
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;

        const clearNextTimeout = () => clearTimeout(timeout);
        const nextTimeout = () => {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => slider.next(), 2500);
        };

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <section className="py-10 block sm:hidden bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-md font-medium text-center mb-6">
          Welcome to PANHARITH PHARMACY
        </p>
        <div className="relative">
          <div ref={sliderRef} className="keen-slider">
            {products.map((product) => (
              <Link
                to={`/product/${product.id}`}   
                key={product.id}
                className="keen-slider__slide bg-gray-50 dark:bg-gray-700 p-4 rounded shadow"
              >
                <img
                  src={product.image}
                  className="w-full h-32 object-cover rounded mb-3"
                  alt={product.name}
                />
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {product.price}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSlider;
