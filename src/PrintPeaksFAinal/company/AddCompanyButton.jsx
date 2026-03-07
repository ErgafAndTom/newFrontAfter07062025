import React, { useState } from 'react';
import AddCompanyModal from './AddCompanyModal';
import { useSelector } from 'react-redux';

function AddCompanyButton({ onCreated }) {
  const [show, setShow] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);

  return (
    <>
      <div className="buttonSkewedUser" onClick={() => setShow(true)}>
        <span>Створити компанію</span>
      </div>

      {show && (
        <AddCompanyModal
          user={currentUser}
          showAddCompany={show}
          setShowAddCompany={(val) => {
            setShow(val);
            if (!val && onCreated) onCreated();
          }}
        />
      )}
    </>
  );
}

export default AddCompanyButton;
