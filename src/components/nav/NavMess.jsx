import {
  FaAdjust,
  FaAllergies,
  FaAngry, FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaArrowAltCircleUp,
  FaFacebookSquare,
  FaSmile
} from "react-icons/fa";
import React, {useEffect, useState} from "react";
import axios from '../../api/axiosInstance';
import {Fa0, FaAnchorCircleCheck, FaAnchorCircleExclamation, FaAnchorCircleXmark} from "react-icons/fa6";

const NavMess = ({currentUser, basicActive}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res = await axios.post('/trello/getdataPost', {
          userId: currentUser.id
        });
        console.log(res.data.length);
        setData(res.data.length);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.id]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <FaArrowAltCircleRight style={{fontSize: '1.1rem'}}/>{" "}{data}{" "}{" "}
      <FaArrowAltCircleLeft style={{fontSize: '1.1rem'}}/>
    </>
  );
};

export default NavMess;
