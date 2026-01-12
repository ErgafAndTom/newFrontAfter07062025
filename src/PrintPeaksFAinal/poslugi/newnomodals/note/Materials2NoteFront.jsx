import React, {useEffect, useState} from "react";
import axios from "../../../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {Spinner} from "react-bootstrap";
import "./styles.css";
import NewNoModalCornerRounding from "../NewNoModalBig";
import BigInBooklet from "../BigInBooklet";
import   "../../NewSheetCutBw.css";