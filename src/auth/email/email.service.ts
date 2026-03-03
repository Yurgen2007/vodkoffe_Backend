import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as jwt from 'jsonwebtoken';
import { Usuarios } from "../../usuarios/entities/usuario.entity";
import { Repository } from "typeorm";
import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import { mailBody } from "./mail.body";

interface MailCredentials {
    serviceMail: string;
    mailUser: string;
    mailPassword: string;
}

@Injectable()

export class EmailService {
    private nodemailerTransport: Transporter;

    private readonly logger = new Logger(EmailService.name);

    constructor(

        private readonly configService: ConfigService,
        @InjectRepository(Usuarios)
        private usuarioRepository: Repository<Usuarios>
    ) {
        this.nodemailerTransport = createTransport({
            service: this.configService.get<string>('SERVICE_MAIL'),
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD')
            }
        })
    }

    private createTransporter(credentials: MailCredentials): Transporter {
        return createTransport({
            service: credentials.serviceMail,
            auth: {
                user: credentials.mailUser,
                pass: credentials.mailPassword
            }
        });
    }

    public async sendMail(options: SendMailOptions, credentials: MailCredentials) {
        const transporter = this.createTransporter(credentials);
        this.logger.log('Email sent out to', options.to);
        return transporter.sendMail(options);
    }


    async sendResetPasswordLink(correo: string, credentials: MailCredentials): Promise<void> {

        const user = this.usuarioRepository.findOne({
            where: { correo }
        });

        if (!user) {
            throw new HttpException(`No se encontro ningun usuario con el correo ${correo}`, HttpStatus.NOT_FOUND)
        }

        const payload = { correo };

        const token = jwt.sign(payload, this.configService.get("SECRET"), {
            expiresIn: this.configService.get("EXPIRES") ?? "1h"
        });

        const url = `${this.configService.get("BASE_URL")}/reset-password?token=${token}`;

        const html = mailBody(url);



        return this.sendMail({
            to: correo,
            subject: 'Reset password',
            html,

        }, credentials);

    }

    async decodeConfirmationToken(token: string) {
        try {
            const payload = await jwt.verify(token, this.configService.get('SECRET'));

            if (typeof payload === 'object' && 'correo' in payload) {
                return payload.correo;
            }

            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException(
                    'Email confirmation token expired'
                );
            }
            throw new BadRequestException('Bad confirmation token');
        }
    }

    /**
     * Envía email de notificación de lote por vencer
     */
    async sendLotePorVencerEmail(
        correo: string,
        nombreUsuario: string,
        codigoLote: string,
        fechaVencimiento: string,
        diasRestantes: number,
        credentials: MailCredentials
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f97316;">⚠️ Alerta de Lote por Vencer</h2>
                <p>Hola <strong>${nombreUsuario}</strong>,</p>
                <p>Se le notifica que el siguiente lote está próximo a vencer:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Código del Lote:</strong> ${codigoLote}</p>
                    <p><strong>Fecha de Vencimiento:</strong> ${fechaVencimiento}</p>
                    <p><strong>Días Restantes:</strong> <span style="color: #f97316; font-weight: bold;">${diasRestantes} días</span></p>
                </div>
                <p>Por favor tome las medidas necesarias.</p>
                <hr>
                <p style="color: #6b7280; font-size: 12px;">
                    Este es un mensaje automático del sistema Vodcoffe. Por favor no responder a este correo.
                </p>
            </div>
        `;

        return this.sendMail({
            to: correo,
            subject: `⚠️ Alerta: Lote ${codigoLote} por vencer en ${diasRestantes} días`,
            html,
        }, credentials);
    }

    /**
     * Envía email de notificación de stock bajo
     */
    async sendStockBajoEmail(
        correo: string,
        nombreUsuario: string,
        codigoLote: string,
        cantidadUnidades: number,
        credentials: MailCredentials
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">📦 Alerta de Stock Bajo</h2>
                <p>Hola <strong>${nombreUsuario}</strong>,</p>
                <p>Se le notifica que el siguiente lote tiene stock bajo:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Código del Lote:</strong> ${codigoLote}</p>
                    <p><strong>Cantidad Restante:</strong> <span style="color: #dc2626; font-weight: bold;">${cantidadUnidades} unidades</span></p>
                </div>
                <p>Por favor considere reabastecer este producto.</p>
                <hr>
                <p style="color: #6b7280; font-size: 12px;">
                    Este es un mensaje automático del sistema Vodcoffe. Por favor no responder a este correo.
                </p>
            </div>
        `;

        return this.sendMail({
            to: correo,
            subject: `📦 Alerta: Stock bajo en lote ${codigoLote} - ${cantidadUnidades} unidades`,
            html,
        }, credentials);
    }
}
