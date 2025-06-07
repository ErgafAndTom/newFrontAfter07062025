import React, {useState} from "react";
import {
    MDBContainer,
    MDBRow,
    MDBCard,
    MDBCardHeader,
    MDBCol,
    MDBCardBody,
    MDBCardFooter,
    MDBIcon,
    MDBTable,
    MDBTableHead,
    MDBTableBody,
    MDBBtn,
    MDBBadge,
} from 'mdb-react-ui-kit';

export const CurrentUser = () => {
    const [datepickerValue, setDatepickerValue] = useState('');

    return (
        <h1>
            current user settings
        </h1>
    )
    // return (
    //     <MDBContainer fluid>
    //         <MDBRow className='justify-content-center'>
    //             <MDBCol md='10'>
    //                 <section>
    //                     <MDBCard>
    //                         <MDBCardHeader className='py-3'>
    //                             <MDBRow>
    //                                 <MDBCol size='6'>
    //                                     <li className='text-uppercase small mb-2'>
    //                                         <strong>USERS</strong>
    //                                     </li>
    //                                     <h5 className='mb-0'>
    //                                         <strong>23 456</strong>
    //                                         <small className='text-success ms-2'>
    //                                             <MDBIcon fas size='sm' icon='arrow-up' className='pe-1' />
    //                                             13,48%
    //                                         </small>
    //                                     </h5>
    //                                 </MDBCol>
    //
    //                                 <MDBCol size='6' className='text-end'>
    //                                     <MDBBtn type='button' className='mt-2'>
    //                                         Details
    //                                     </MDBBtn>
    //                                 </MDBCol>
    //                             </MDBRow>
    //                         </MDBCardHeader>
    //
    //                         <MDBCardBody>
    //                             <MDBRow>
    //                                 <MDBCol md='8' className='mb-4'>
    //                                     <MDBTable hover>
    //                                         <MDBTableHead>
    //                                             <tr>
    //                                                 <th>Country</th>
    //                                                 <th>Sales</th>
    //                                                 <th>Value</th>
    //                                                 <th>Purchased?</th>
    //                                             </tr>
    //                                         </MDBTableHead>
    //                                         <MDBTableBody>
    //                                             <tr>
    //                                                 <td>Norway</td>
    //                                                 <td>$72.63</td>
    //                                                 <td>8</td>
    //                                                 <td>
    //                                                     <MDBBadge color='success'>Yes</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Barbados</td>
    //                                                 <td>$81.52</td>
    //                                                 <td>4</td>
    //                                                 <td>
    //                                                     <MDBBadge color='success'>Yes</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>France</td>
    //                                                 <td>$76.02</td>
    //                                                 <td>3</td>
    //                                                 <td>
    //                                                     <MDBBadge color='danger'>No</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Egypt</td>
    //                                                 <td>$53.21</td>
    //                                                 <td>6</td>
    //                                                 <td>
    //                                                     <MDBBadge color='danger'>No</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>South Korea</td>
    //                                                 <td>$3.93</td>
    //                                                 <td>6</td>
    //                                                 <td>
    //                                                     <MDBBadge color='success'>Yes</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Finland</td>
    //                                                 <td>$31.58</td>
    //                                                 <td>9</td>
    //                                                 <td>
    //                                                     <MDBBadge color='danger'>No</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Mayotte</td>
    //                                                 <td>$11.20</td>
    //                                                 <td>5</td>
    //                                                 <td>
    //                                                     <MDBBadge color='danger'>No</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Netherlands</td>
    //                                                 <td>$75.94</td>
    //                                                 <td>7</td>
    //                                                 <td>
    //                                                     <MDBBadge color='warning'>Pending</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Slovenia</td>
    //                                                 <td>$48.54</td>
    //                                                 <td>10</td>
    //                                                 <td>
    //                                                     <MDBBadge color='success'>Yes</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Spain</td>
    //                                                 <td>$64.32</td>
    //                                                 <td>5</td>
    //                                                 <td>
    //                                                     <MDBBadge color='success'>Yes</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                             <tr>
    //                                                 <td>Italy</td>
    //                                                 <td>$52.15</td>
    //                                                 <td>7</td>
    //                                                 <td>
    //                                                     <MDBBadge color='warning'>Pending</MDBBadge>
    //                                                 </td>
    //                                             </tr>
    //                                         </MDBTableBody>
    //                                     </MDBTable>
    //                                 </MDBCol>
    //
    //                                 <MDBCol md='4' className='mb-4'>
    //                                     {/*<MDBChart*/}
    //                                     {/*    type='radar'*/}
    //                                     {/*    data={{*/}
    //                                     {/*        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],*/}
    //                                     {/*        datasets: [*/}
    //                                     {/*            {*/}
    //                                     {/*                label: 'Traffic',*/}
    //                                     {/*                data: [2112, 2343, 2545, 3423, 2365, 1985, 987],*/}
    //                                     {/*                backgroundColor: [*/}
    //                                     {/*                    'rgba(63, 81, 181, 0.5)',*/}
    //                                     {/*                    'rgba(77, 182, 172, 0.5)',*/}
    //                                     {/*                    'rgba(66, 133, 244, 0.5)',*/}
    //                                     {/*                    'rgba(156, 39, 176, 0.5)',*/}
    //                                     {/*                    'rgba(233, 30, 99, 0.5)',*/}
    //                                     {/*                    'rgba(66, 73, 244, 0.4)',*/}
    //                                     {/*                    'rgba(66, 133, 244, 0.2)',*/}
    //                                     {/*                ],*/}
    //                                     {/*            },*/}
    //                                     {/*        ],*/}
    //                                     {/*    }}*/}
    //                                     {/*/>*/}
    //
    //                                     {/*<MDBChart*/}
    //                                     {/*    type='polarArea'*/}
    //                                     {/*    data={{*/}
    //                                     {/*        labels: ['Monday', 'Tuesday', 'Wednesday'],*/}
    //                                     {/*        datasets: [*/}
    //                                     {/*            {*/}
    //                                     {/*                label: 'Traffic',*/}
    //                                     {/*                data: [2112, 2343, 2545],*/}
    //                                     {/*                backgroundColor: [*/}
    //                                     {/*                    'rgba(63, 81, 181, 0.5)',*/}
    //                                     {/*                    'rgba(77, 182, 172, 0.5)',*/}
    //                                     {/*                    'rgba(66, 133, 244, 0.5)',*/}
    //                                     {/*                ],*/}
    //                                     {/*            },*/}
    //                                     {/*        ],*/}
    //                                     {/*    }}*/}
    //                                     {/*/>*/}
    //                                 </MDBCol>
    //                             </MDBRow>
    //                         </MDBCardBody>
    //
    //                         <MDBCardFooter className='py-4'>
    //                             <MDBRow>
    //                                 <MDBCol md='6'>
    //                                     {/*<MDBSelectDeprecated*/}
    //                                     {/*    label='Date'*/}
    //                                     {/*    data={[*/}
    //                                     {/*        { text: 'Today', value: 1, selected: true },*/}
    //                                     {/*        { text: 'Yesterday', value: 2 },*/}
    //                                     {/*        { text: 'Last 7 days', value: 3 },*/}
    //                                     {/*        { text: 'Last 28 days', value: 4 },*/}
    //                                     {/*        { text: 'Last 90 days', value: 5 },*/}
    //                                     {/*    ]}*/}
    //                                     {/*/>*/}
    //                                 </MDBCol>
    //
    //                                 <MDBCol md='6'>
    //                                     {/*<MDBDatepicker value={datepickerValue} setValue={setDatepickerValue} labelText='Date' />*/}
    //                                 </MDBCol>
    //                             </MDBRow>
    //                         </MDBCardFooter>
    //                     </MDBCard>
    //                 </section>
    //             </MDBCol>
    //         </MDBRow>
    //
    //     </MDBContainer>
    // )
}