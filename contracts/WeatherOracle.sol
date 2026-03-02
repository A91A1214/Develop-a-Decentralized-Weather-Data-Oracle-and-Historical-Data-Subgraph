// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WeatherOracle
 * @dev A decentralized weather data oracle using Chainlink Any API.
 */
contract WeatherOracle is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    // Events
    event WeatherRequested(bytes32 indexed requestId, string city, address indexed requester);
    event WeatherReported(bytes32 indexed requestId, string city, int256 temperature, string description, uint256 timestamp, address requester);

    struct WeatherReport {
        string city;
        int256 temperature;
        string description;
        uint256 timestamp;
        address requester;
    }

    // State variables
    mapping(bytes32 => WeatherReport) public weatherReports;
    mapping(bytes32 => string) private requestToCity;
    
    address public oracle;         // Chainlink Oracle address
    bytes32 public jobId;          // Chainlink Job ID
    uint256 public fee;            // Chainlink fee in LINK

    constructor(address _link, address _oracle, bytes32 _jobId, uint256 _fee) Ownable() {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }

    /**
     * @notice Requests weather data for a specific city.
     * @param _city The name of the city.
     */
    function requestWeather(string memory _city) public returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Example parameters for an external adapter or bridge
        request.add("get", "https://api.openweathermap.org/data/2.5/weather?q=");
        request.add("city", _city);
        request.add("path", "temp,description"); // Assuming adapter returns comma separated string

        requestId = sendChainlinkRequest(request, fee);
        requestToCity[requestId] = _city;
        weatherReports[requestId].requester = msg.sender;

        emit WeatherRequested(requestId, _city, msg.sender);
    }

    /**
     * @notice Callback function used by Chainlink Oracle to return weather data.
     * @param _requestId The ID of the request.
     * @param _weatherData The weather data returned by the oracle (expected format: "temp,description").
     */
    function fulfill(bytes32 _requestId, string memory _weatherData) public recordChainlinkFulfillment(_requestId) {
        // Simple parsing logic for "temp,description"
        bytes memory b = bytes(_weatherData);
        uint256 commaIndex = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] == ",") {
                commaIndex = i;
                break;
            }
        }

        require(commaIndex > 0, "Invalid weather data format");

        string memory tempStr = subString(_weatherData, 0, commaIndex);
        string memory description = subString(_weatherData, commaIndex + 1, b.length);
        
        int256 temperature = stringToInt(tempStr);
        string memory city = requestToCity[_requestId];

        weatherReports[_requestId] = WeatherReport({
            city: city,
            temperature: temperature,
            description: description,
            timestamp: block.timestamp,
            requester: weatherReports[_requestId].requester
        });

        emit WeatherReported(_requestId, city, temperature, description, block.timestamp, weatherReports[_requestId].requester);
    }

    // Helper functions for string manipulation
    function subString(string memory str, uint256 startIndex, uint256 endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    function stringToInt(string memory s) internal pure returns (int256) {
        bytes memory b = bytes(s);
        int256 result = 0;
        uint256 i = 0;
        bool negative = false;
        if (b.length > 0 && b[0] == "-") {
            negative = true;
            i++;
        }
        for (; i < b.length; i++) {
            if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
                result = result * 10 + (int256(uint8(b[i])) - 48);
            }
        }
        return negative ? -result : result;
    }

    // Access control functions
    function setChainlinkOracle(address _oracle) public onlyOwner {
        oracle = _oracle;
        setOracle(_oracle);
    }

    function setJobId(bytes32 _jobId) public onlyOwner {
        jobId = _jobId;
    }

    function setFee(uint256 _fee) public onlyOwner {
        fee = _fee;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    receive() external payable {}
}
