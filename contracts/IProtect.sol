// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract IProtect {
    struct Certificate {
        string uuid;
        string docId;
        string sha256;
    }

    address private creator;
    mapping(string => Certificate) certificates;

    constructor() {
        creator = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == creator, "Only creator is allowed to call this function");
        _;
    }

    event NewCertificateIssue(string _uuid, string _docId, string _sha256);

    function issueCertificate(
        string memory _uuid,
        string memory _docId,
        string memory _sha256
        ) public onlyOwner {
            Certificate memory certificate = Certificate(_uuid, _docId, _sha256);
            certificates[_uuid] = certificate;

            emit NewCertificateIssue(_uuid, _docId, _sha256);
    }

    function getByUUID(string memory _uuid)
        public
        view
        returns (
            string memory,
            string memory,
            string memory) {
                Certificate storage out = certificates[_uuid];
                return (out.uuid, out.docId, out.sha256);
    }
}