import React from "react";
import logo from "../assets/qw.png";

export default function ClientInvoice({
  project,
  items,
  grandTotal,
  invoiceDate,
  
}) {
  return (
    <div
  id="invoice"
  style={{
    width: "760px",
    height: "980px",
    padding: "40px",
    background: "#ffffff",
    color: "#1f2937",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    overflow: "visible",
    
  }}
>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "24px",
        }}
      >

        <div>
          <img
            src={logo}
            alt="Company Logo"
            style={{
              width: "200px",
              height: "130px",
              objectFit: "contain",
            }}
          />
        </div>


        <div style={{ textAlign: "right" }}>

          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            CLIENT INVOICE
          </h2>


          <p>
            Invoice # INV-{Date.now()}
          </p>


          <p>
  {invoiceDate
    ? new Date(invoiceDate).toLocaleDateString()
    : new Date().toLocaleDateString()}
</p>

        </div>

      </div>



      {/* Client Information */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginTop: "32px",
        }}
      >

        <div>

          <h3
            style={{
              fontSize: "20px",
            }}
          >
            Client Information
          </h3>


          <p>
            <strong>Client:</strong>{" "}
            {project?.client || "N/A"}
          </p>


          <p>
            <strong>Project:</strong>{" "}
            {project?.name || "N/A"}
          </p>


          <p>
            <strong>Site:</strong>{" "}
            {project?.location || "N/A"}
          </p>

        </div>



       

      </div>




      {/* Items Table */}
      <table
        style={{
          width: "100%",
          marginTop: "40px",
          borderCollapse: "collapse",
        }}
      >

        <thead>

          <tr
            style={{
              background: "#41181c",
              color: "#ffffff",
            }}
          >

            <th
              style={{
                padding: "12px",
                textAlign: "left",
              }}
            >
              Description
            </th>


            <th
              style={{
                padding: "12px",
                textAlign: "center",
              }}
            >
              Qty
            </th>


            <th
              style={{
                padding: "12px",
                textAlign: "center",
              }}
            >
              Unit Cost
            </th>


            <th
              style={{
                padding: "12px",
                textAlign: "right",
              }}
            >
              Total
            </th>

          </tr>

        </thead>



        <tbody>

          {items.map((item, index) => (

            <tr key={index}>

              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {item.description}
              </td>


              <td
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {item.quantity}
              </td>



              <td
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Rs. {Number(item.unitCost).toLocaleString()}
              </td>



              <td
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Rs. {(Number(item.quantity) * Number(item.unitCost)).toLocaleString()}
              </td>

            </tr>

          ))}

        </tbody>

      </table>




      {/* Total */}
      <div
        style={{
          marginTop: "40px",
          padding: "24px",
          borderRadius: "16px",
          background: "#f0fdf4",
          textAlign: "center",
        }}
      >

        <p
          style={{
            fontSize: "18px",
          }}
        >
          TOTAL AMOUNT
        </p>


        <h1
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#15803d",
            margin: 0,
          }}
        >
          Rs. {grandTotal.toLocaleString()}
        </h1>

      </div>




      {/* Notes */}
      <div
        style={{
          marginTop: "32px",
        }}
      >

        <h3>
          Notes
        </h3>


        <p
          style={{
            color: "#64748b",
          }}
        >
          Thank you for choosing Pilot Se Ghar construction services.
          We appreciate your business and look forward to working with you again.
        </p>

      </div>




    
{/* Footer */}
<div
  style={{
    marginTop: "60px",
    textAlign: "center",
    color: "#374151",
  }}
>
  <div
    style={{
      paddingTop: "20px",
      borderTop: "1px solid #d1d5db",
    }}
  >
    <p
      style={{
        margin: "0 0 6px 0",
        fontSize: "15px",
        fontWeight: "700",
        color: "#41181c",
      }}
    >
      RANA HAMZA TARIQ
    </p>

    <p
      style={{
        margin: "0 0 6px 0",
        fontSize: "14px",
      }}
    >
      0310-4467668
    </p>

    <p
      style={{
        margin: "0",
        fontSize: "14px",
        lineHeight: "1.5",
      }}
    >
      Office # 28 Galaxy Hill Plaza, Block A&nbsp;&nbsp;Near Arc Monument Faisal Hills
    </p>

    <p
      style={{
        marginTop: "20px",
        color: "#64748b",
        fontSize: "13px",
        fontStyle: "italic",
      }}
    >
      This is a computer-generated invoice and does not require a physical signature.
    </p>
  </div>
</div>


  



    </div>
  );
}
