const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('ID_PROOF', 'ADDRESS_PROOF', 'PHOTO'),
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mimeType: {
        type: DataTypes.STRING,
    },
    verificationStatus: {
        type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
        defaultValue: 'PENDING',
    },
    aiConfidence: {
        type: DataTypes.FLOAT, // 0.0 to 1.0
        defaultValue: 0.0,
    },
    extractedData: {
        type: DataTypes.JSON, // Stores OCR results
    },
    adminComments: {
        type: DataTypes.TEXT,
    }
}, {
    timestamps: true,
});

// Associations
User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

module.exports = Document;
