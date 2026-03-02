import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_WEATHER_REPORTS = gql`
  query GetWeatherReports {
    weatherReports(orderBy: timestamp, orderDirection: desc) {
      id
      city
      temperature
      description
      timestamp
      requester
    }
  }
`;

function WeatherReportsList() {
    const { loading, error, data } = useQuery(GET_WEATHER_REPORTS, {
        pollInterval: 5000,
    });

    if (loading) return <p>Loading reports...</p>;
    if (error) return <p>Error loading reports: {error.message}</p>;

    return (
        <div className="reports-list">
            {data.weatherReports.length === 0 ? (
                <p>No weather reports found yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>City</th>
                            <th>Temp (°K)</th>
                            <th>Description</th>
                            <th>Timestamp</th>
                            <th>Requester</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.weatherReports.map((report) => (
                            <tr key={report.id}>
                                <td>{report.city}</td>
                                <td>{report.temperature}</td>
                                <td>{report.description}</td>
                                <td>{new Date(report.timestamp * 1000).toLocaleString()}</td>
                                <td>{report.requester.substring(0, 6)}...{report.requester.substring(38)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default WeatherReportsList;
