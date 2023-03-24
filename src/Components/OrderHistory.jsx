import React from 'react'
import styled from 'styled-components';
import data from '../orderhistory.json'


const TableContainer = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 10s ease infinite;
  background-size: 400% 400%;
  background-attachment: fixed;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
`;
const TableHeader = styled.tr`
   background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 10s ease infinite;
  background-size: 400% 400%;
  background-attachment: fixed;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;
const TableRow = styled.tr`
  color: #fff;
  font-size: 14px;
  padding: 10px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 10s ease infinite;
  background-size: 400% 400%;
  background-attachment: fixed;
`;




function OrderHistory() {
  
    
        return (
          <TableContainer>
            <thead>
              <TableHeader>
                <input type="checkbox" />
                <th>Type</th>
                <th>Order</th>
                <th>price </th>
                <th>Marked Price </th>
              </TableHeader>
            </thead>
            <tbody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <td>{<input type="checkbox" />}</td>
                  <td>{item.type}</td>
                  <td>{item.order}</td>
                  <td>{item.price}</td>
                  <td>{item.markedprice}</td>
                  
                </TableRow>
              ))}
            </tbody>
          </TableContainer>
        );
      };
      
  


export default OrderHistory