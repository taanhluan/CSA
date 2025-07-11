// src/components/DetailsTable.tsx
import React from "react";
import styles from "./DetailsTable.module.css";

interface Props {
  detailData: any[];
  detailType: string;
}

const DetailsTable: React.FC<Props> = ({ detailData, detailType }) => {
  if (detailData.length === 0) {
    return <p className={styles.noData}>Không có dữ liệu để hiển thị.</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Khách</th>
            <th scope="col">Ngày</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Tổng tiền</th>
            {(detailType === "partial" || detailType === "debt") && (
              <>
                <th scope="col">Giảm giá</th>
                <th scope="col">Tiền cọc</th>
                <th scope="col">Đã trả</th>
                <th scope="col">Còn nợ</th>
                <th scope="col">Ghi chú</th>
                <th scope="col">Log gần nhất</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {detailData.map((item) => (
            <tr key={item.id} className={styles.hoverRow}>
              <td>{item.member_name || item.full_name || "Khách vãng lai"}</td>
              <td>
                {item.date_time
                  ? new Date(item.date_time).toLocaleString("vi-VN")
                  : <span className={styles.debtNote}>Không có</span>}
              </td>
              <td>{item.status}</td>
              <td>{Number(item.grand_total ?? 0).toLocaleString("vi-VN")}₫</td>
              {(detailType === "partial" || detailType === "debt") && (
                <>
                  <td>{Number(item.discount ?? 0).toLocaleString("vi-VN")}₫</td>
                  <td>{Number(item.deposit_amount ?? 0).toLocaleString("vi-VN")}₫</td>
                  <td>{Number(item.amount_paid ?? 0).toLocaleString("vi-VN")}₫</td>
                  <td>{Number((item.grand_total ?? 0) - (item.amount_paid ?? 0)).toLocaleString("vi-VN")}₫</td>
                  <td>{item.debt_note || <span className={styles.debtNote}>Không có</span>}</td>
                  <td title={item.log_history}>
                    {item.log_history
                      ? item.log_history.split("\n").pop()
                      : <span className={styles.debtNote}>Không có</span>}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailsTable;
