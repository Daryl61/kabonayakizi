// SOAP Service Implementation - Communication Layer
const soap = require('soap');
const CarbonCalculationService = require('./CarbonCalculationService');
const CarbonRecord = require('../models/CarbonRecord');

// SOAP Service tanımı (WSDL)
const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:tns="http://carbonfootprint.service/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    targetNamespace="http://carbonfootprint.service/">
    
    <types>
        <xsd:schema targetNamespace="http://carbonfootprint.service/">
            <xsd:element name="CalculateCarbonRequest">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="userId" type="xsd:int"/>
                        <xsd:element name="transport">
                            <xsd:complexType>
                                <xsd:sequence>
                                    <xsd:element name="carKm" type="xsd:double" minOccurs="0"/>
                                    <xsd:element name="busKm" type="xsd:double" minOccurs="0"/>
                                    <xsd:element name="trainKm" type="xsd:double" minOccurs="0"/>
                                    <xsd:element name="planeKm" type="xsd:double" minOccurs="0"/>
                                </xsd:sequence>
                            </xsd:complexType>
                        </xsd:element>
                        <xsd:element name="energy">
                            <xsd:complexType>
                                <xsd:sequence>
                                    <xsd:element name="electricityHours" type="xsd:double" minOccurs="0"/>
                                    <xsd:element name="gasHours" type="xsd:double" minOccurs="0"/>
                                </xsd:sequence>
                            </xsd:complexType>
                        </xsd:element>
                        <xsd:element name="food">
                            <xsd:complexType>
                                <xsd:sequence>
                                    <xsd:element name="meatMeals" type="xsd:int" minOccurs="0"/>
                                    <xsd:element name="vegetarianMeals" type="xsd:int" minOccurs="0"/>
                                </xsd:sequence>
                            </xsd:complexType>
                        </xsd:element>
                        <xsd:element name="shopping">
                            <xsd:complexType>
                                <xsd:sequence>
                                    <xsd:element name="amount" type="xsd:double" minOccurs="0"/>
                                </xsd:sequence>
                            </xsd:complexType>
                        </xsd:element>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            <xsd:element name="CalculateCarbonResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="total" type="xsd:double"/>
                        <xsd:element name="transport" type="xsd:double"/>
                        <xsd:element name="energy" type="xsd:double"/>
                        <xsd:element name="food" type="xsd:double"/>
                        <xsd:element name="shopping" type="xsd:double"/>
                        <xsd:element name="recordId" type="xsd:int"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
        </xsd:schema>
    </types>
    
    <message name="CalculateCarbonRequest">
        <part name="body" element="tns:CalculateCarbonRequest"/>
    </message>
    <message name="CalculateCarbonResponse">
        <part name="body" element="tns:CalculateCarbonResponse"/>
    </message>
    
    <portType name="CarbonFootprintPortType">
        <operation name="CalculateCarbon">
            <input message="tns:CalculateCarbonRequest"/>
            <output message="tns:CalculateCarbonResponse"/>
        </operation>
    </portType>
    
    <binding name="CarbonFootprintBinding" type="tns:CarbonFootprintPortType">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="CalculateCarbon">
            <soap:operation soapAction="http://carbonfootprint.service/CalculateCarbon"/>
            <input>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
    </binding>
    
    <service name="CarbonFootprintService">
        <port name="CarbonFootprintPort" binding="tns:CarbonFootprintBinding">
            <soap:address location="http://localhost:3000/soap"/>
        </port>
    </service>
</definitions>`;

// SOAP Service metodları
const service = {
    CarbonFootprintService: {
        CarbonFootprintPortType: {
            CalculateCarbon: async function(args) {
                try {
                    const { userId, transport, energy, food, shopping } = args;
                    
                    // Karbon hesaplama
                    const carbonData = CarbonCalculationService.calculateTotalCarbon({
                        transport: transport || {},
                        energy: energy || {},
                        food: food || {},
                        shopping: shopping || {}
                    });

                    // Veritabanına kaydet
                    const recordId = await CarbonRecord.create(userId, {
                        recordDate: new Date().toISOString().split('T')[0],
                        totalCarbon: carbonData.total,
                        transportCarbon: carbonData.transport,
                        energyCarbon: carbonData.energy,
                        foodCarbon: carbonData.food,
                        shoppingCarbon: carbonData.shopping
                    });

                    return {
                        total: carbonData.total,
                        transport: carbonData.transport,
                        energy: carbonData.energy,
                        food: carbonData.food,
                        shopping: carbonData.shopping,
                        recordId: recordId
                    };
                } catch (error) {
                    throw new Error(`SOAP Service Error: ${error.message}`);
                }
            }
        }
    }
};

// SOAP servisini kur
const setupSoapService = (app) => {
    app.use('/soap', (req, res, next) => {
        if (req.url.includes('?wsdl')) {
            res.setHeader('Content-Type', 'application/xml');
            res.send(wsdl);
        } else {
            next();
        }
    });

    soap.listen(app, '/soap', service, wsdl, () => {
        console.log('✅ SOAP Service başlatıldı: http://localhost:3000/soap?wsdl');
    });
};

module.exports = { setupSoapService };

