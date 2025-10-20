import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "./Starrating.css"


const Starrating = ({rating, rateColor, handleStarRating, disabled = false}) => {

    const handleStarClick = (currRate) => {
        if (disabled) return; // Don't handle clicks if disabled

        if (handleStarRating) {
            handleStarRating(currRate);
        }
    };

    return (
        <>
            {[...Array(5)].map((_, i) => {
                const currRate = i + 1;
                return (
                    <label
                        htmlFor={"star" + i}
                        key={i}
                        className='real-rating'
                        onClick={() => handleStarClick(currRate)}
                        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
                    >
                        <input
                            type="radio"
                            name="rating"
                            className="star_input"
                            id={"star" + i}
                            value={currRate}
                            onChange={() => handleStarClick(currRate)}
                            disabled={disabled}
                        />
                        <FontAwesomeIcon
                            icon={faStar}
                            className="rating-star"
                            color={currRate <= (rateColor || rating) ? "#5E0096" : "grey"}
                        />
                    </label>
                )
            })}
        </>
    )
}

export default Starrating