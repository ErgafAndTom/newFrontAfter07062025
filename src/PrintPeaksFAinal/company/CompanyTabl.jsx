import React, { useEffect, useState } from "react";
import "./CompanyTable.css";
import axios from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiPhone } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { Settings } from "lucide-react";
import TelegramAvatar from "../Messages/TelegramAvatar";
import Pagination from "../tools/Pagination";
import FiltrOrders from "../Orders/FiltrOrders";
import { searchChange } from "../../actions/searchAction";
import Loader from "../../components/calc/Loader";
import AddCompanyModal from "./AddCompanyModal";
import ModalDeleteOrder from "../Orders/ModalDeleteOrder";

const CompanyTabl = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [thisOrderForDelete, setThisOrderForDelete] = useState(null);

  const [expandedCompanyId, setExpandedCompanyId] = useState(null);

  const [typeSelect, setTypeSelect] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statuses, setStatuses] = useState({
    status0: true,
    status1: true,
    status2: true,
    status3: true,
    status4: true,
    status5: true,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const search = useSelector((state) => state.search.search);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const res = await axios.post("/api/company/all", {
            inPageCount: limit,
            currentPage,
            search,
            columnName: { column: "id", reverse: true },
            startDate,
            endDate,
            statuses,
          });
          setData(res.data);
        } catch (err) {
          if (err.response?.status === 403) navigate("/login");
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      setLoading(true);
      fetchData();
    }
  }, [search, currentPage, limit, user, startDate, endDate, statuses]);

  useEffect(() => {
    dispatch(searchChange(""));
  }, []);

  const handleAddCompany = () => setShowAddCompany(true);
  const handleOrderClickDelete = (company) => {
    setThisOrderForDelete(company);
    setShowDeleteOrderModal(true);
  };

  if (error) return <div className="text-center text-danger">{error}</div>;

  return (
    <div className="CompanyTable">
      <div className="d-flex justify-content-start align-items-center">
        <FiltrOrders
          typeSelect={typeSelect}
          setTypeSelect={setTypeSelect}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          statuses={statuses}
          setStatuses={setStatuses}
        />
        <div className="d-flex" style={{ opacity: "0.7", margin: "auto", position:"unset", top:"0", right:"33%" }}>
          Знайдено {data?.count} шт
        </div>
      </div>

      {/* Header */}
      <div className="CompanyTable-row CompanyTable-header">
        <div className="CompanyTable-cell id">ID</div>
        <div className="CompanyTable-cell name">Назва</div>
        <div className="CompanyTable-cell edropu">ЄДРОПУ</div>
        <div className="CompanyTable-cell discount">Знижка</div>
        <div className="CompanyTable-cell address">Адреса</div>
        <div className="CompanyTable-cell telephone1">Телефон</div>
        <div className="CompanyTable-cell telegram"><FaTelegramPlane size={20}/></div>
        <div className="CompanyTable-cell users">Співробітники</div>
        <div className="CompanyTable-cell settings"><Settings size={20}/></div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
          <Loader />
        </div>
      )}

      {data?.rows.map((company) => {
        const isExpanded = expandedCompanyId === company.id;
        return (
          <div key={company.id}>
            <div
              className="CompanyTable-row CompanyTable-rowHover"
              onClick={() =>
                setExpandedCompanyId(isExpanded ? null : company.id)
              }
            >
              <div className="CompanyTable-cell id">{company.id}</div>
              <div className="CompanyTable-cell name">{company.companyName || "···"}</div>
              <div className="CompanyTable-cell edropu">{company.edropu || "···"}</div>
              <div className="CompanyTable-cell discount">{company.discount || "···"}</div>

              <div className="CompanyTable-cell address"><p>{company.address || "···"}</p></div>
              <div className="CompanyTable-cell telephone1">{company.phoneNumber || "···"}</div>


              <div className="CompanyTable-cell telegram">
                {company.telegram
                  ? <TelegramAvatar link={company.telegram} size={35} defaultSrc="" />
                  : "···"}
              </div>
              <div className="CompanyTable-cell users">{company.Users.length}</div>
              <div className="CompanyTable-cell settings">
                <Link to={`/Companys/${company.id}`}><Settings size={20}/></Link>
              </div>
            </div>

            {isExpanded && (
              <div className="CompanyTable-expanded">
                <strong>Співробітники:</strong>
                <div className="CompanyTable-usersGrid">
                  {company.Users.map((u) => (
                    <Link key={u.id} to={`/Users/${u.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="CompanyTable-userCard">
                        <div className="CompanyTable-userHeader">
                          <TelegramAvatar link={u.telegram} size={48} />
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {u.firstName} {u.lastName} {u.familyName}
                            </div>
                            <div className="CompanyTable-userInfo">Id: {u.id}</div>
                            <div className="CompanyTable-userInfo">
                              Тел.: {u.phoneNumber || "···"}
                            </div>
                            <div className="CompanyTable-userInfo">
                              E-mail: {u.email || "···"}
                            </div>
                            <div className="CompanyTable-userInfo">
                              Адреса: {u.address || "···"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div
                  style={{ color: "red", cursor: "pointer", marginTop: "1vh" }}
                  onClick={(e) => { e.stopPropagation(); handleOrderClickDelete(company); }}
                >
                  Видалити компанію
                </div>
              </div>
            )}


          </div>
        );
      })}

      <ModalDeleteOrder
        showDeleteOrderModal={showDeleteOrderModal}
        setShowDeleteOrderModal={setShowDeleteOrderModal}
        thisOrderForDelete={thisOrderForDelete}
        setThisOrderForDelete={setThisOrderForDelete}
        data={data}
        setData={setData}
        url={"/api/company/all"}
      />

      {showAddCompany && (
        <AddCompanyModal user={user} setShowAddCompany={setShowAddCompany} showAddCompany={showAddCompany} />
      )}

      <button type="button" className="adminButtonAdd" style={{ marginLeft: "0.3vw" }} onClick={handleAddCompany}>
        Додати компанію
      </button>

      {data?.count > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.count / limit)}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          limit={limit}
        />
      )}
    </div>
  );
};

export default CompanyTabl;
