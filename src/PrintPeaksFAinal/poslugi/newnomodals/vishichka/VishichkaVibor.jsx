import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import nashichka from "./nashichka.svg";
import porizka from "./porizka.svg";
import porizkaOkremimi from "./porizkaOkremimi.svg";
import "./VishichkaVibor.css";

const iconArray = [nashichka, porizka, porizkaOkremimi];

const LABEL_TO_TYPE_USE = {
  "з плотерною надсічкою на надрукованих аркушах": "sheet_cut",
  "з плотерною порізкою стікерпаків": "stickerpack",
  "з плотерною порізкою окремими виробами": "single_items",

  // на випадок якщо десь у тебе ще лишилась стара фраза:
  "з плотерною порізкою на надрукованих аркушах": "sheet_cut",
};

function safeRows(resp) {
  const rows = resp?.data?.rows;
  return Array.isArray(rows) ? rows : [];
}

function sortByButtonsArr(rows, buttonsArr) {
  if (!Array.isArray(buttonsArr) || buttonsArr.length === 0) return rows;

  const idx = new Map(buttonsArr.map((name, i) => [name, i]));

  // якщо у БД назви не 1-в-1, просто не ламаємо порядок
  return [...rows].sort((a, b) => {
    const ai = idx.has(a.name) ? idx.get(a.name) : 9999;
    const bi = idx.has(b.name) ? idx.get(b.name) : 9999;
    return ai - bi;
  });
}

const VishichkaVibor = ({
                          vishichka,
                          setVishichka,
                          buttonsArr = [],
                          size, // залишаю, бо ти передаєш (може знадобитися на бекенді/фільтрах)
                          isEdit, // ВАЖЛИВО: передай сюди Boolean(editingOrderUnit?.id)
                        }) => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // щоб автодефолт спрацював тільки 1 раз на відкриття модалки
  const didAutoPickRef = useRef(false);

  const editMode = useMemo(() => {
    if (typeof isEdit === "boolean") return isEdit;
    // fallback-логіка, якщо не передали isEdit
    return Boolean(vishichka?.materialId || vishichka?.material);
  }, [isEdit, vishichka?.materialId, vishichka?.material]);

  const pick = (item) => {
    if (!item) return;

    setVishichka((prev) => {
      const label = item?.name || "";
      const typeUse = LABEL_TO_TYPE_USE[label] ?? prev?.typeUse ?? null;

      return {
        ...prev,
        type: prev?.type || "vishichka",
        material: label,
        materialId: item?.id,
        typeUse,
      };
    });
  };

  useEffect(() => {
    const data = {
      name: "MaterialsPrices",
      inPageCount: 999999,
      currentPage: 1,
      search: "",
      columnName: { column: "id", reverse: false },
      material: { type: "Vishichka" },
    };

    axios
      .post(`/materials/NotAll`, data)
      .then((response) => {
        const rows = safeRows(response);
        const sorted = sortByButtonsArr(rows, buttonsArr);

        setItems(sorted);

        // ===== EDIT MODE =====
        // Не перетираємо вибір користувача/позиції!
        if (editMode) {
          const curId = vishichka?.materialId;
          const curName = vishichka?.material;

          // якщо ID є і він існує в списку — нічого не робимо
          if (
            curId &&
            sorted.some((r) => String(r.id) === String(curId))
          ) {
            return;
          }

          // якщо ID нема, але є назва — підтягуємо ID по назві (щоб кнопка стала active)
          if (curName) {
            const found = sorted.find((r) => r.name === curName);
            if (found) {
              setVishichka((prev) => ({
                ...prev,
                materialId: found.id,
                typeUse:
                  prev?.typeUse ||
                  LABEL_TO_TYPE_USE[found.name] ||
                  prev?.typeUse ||
                  null,
              }));
            }
          }

          return;
        }

        // ===== NEW MODE =====
        // Для нового — ставимо дефолт (перший у buttonsArr), але тільки 1 раз
        if (!didAutoPickRef.current && sorted.length > 0) {
          const preferredName = buttonsArr?.[0];
          const preferred =
            preferredName ? sorted.find((r) => r.name === preferredName) : null;

          pick(preferred || sorted[0]);
          didAutoPickRef.current = true;
        }
      })
      .catch((error) => {
        if (error?.response?.status === 403) navigate("/login");
        console.log(error?.message);
      });

  }, []); // 1 раз на mount (коли модалка відкрилась)

  return (
    <div className="d-flex allArtemElem" style={{ marginTop: "2vh", justifyContent: "center" }}>
      <div className="d-flex flex-column">
        <div className="d-flex">
          {(items || []).map((item, index) => {
            const active = String(item.id) === String(vishichka?.materialId);
            const iconSrc = iconArray[index] || iconArray[0];

            return (
              <button
                key={item.id}
                className={active ? "buttonsArtem buttonsArtemActive" : "buttonsArtem buttonsArtemNotActive"}
                onClick={() => pick(item)}
                type="button"
              >
                <div
                  className="d-flex flex-column"
                  style={{
                    height: "100%",
                    opacity: active ? "100%" : "50%",
                    whiteSpace: "nowrap",
                    borderRadius: "1vw",
                  }}
                >
                  <img
                    src={iconSrc}
                    alt=""
                    style={{ height: "9vw", marginBottom: "1vw", borderRadius: "1vw" }}
                  />
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VishichkaVibor;
