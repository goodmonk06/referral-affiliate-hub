import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralLinksService } from '../referral-links/referral-links.service';

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private referralLinksService: ReferralLinksService,
  ) {}

  /**
   * Track attribution by referral code (e.g., from ?ref=CODE)
   * Returns partner and program information for the referral
   */
  async trackByCode(code: string) {
    const referralLink = await this.referralLinksService.findByCode(code);

    if (!referralLink) {
      throw new NotFoundException(`Referral code ${code} not found`);
    }

    return {
      success: true,
      referralLink: {
        id: referralLink.id,
        code: referralLink.code,
        urlSlug: referralLink.urlSlug,
      },
      partner: {
        id: referralLink.partner.id,
        name: referralLink.partner.name,
      },
      program: {
        id: referralLink.partner.program.id,
        name: referralLink.partner.program.name,
        type: referralLink.partner.program.type,
      },
    };
  }

  /**
   * Track attribution by URL slug (e.g., from /r/:slug)
   * Returns partner and program information for the referral
   */
  async trackBySlug(urlSlug: string) {
    const referralLink = await this.referralLinksService.findBySlug(urlSlug);

    if (!referralLink) {
      throw new NotFoundException(`Referral slug ${urlSlug} not found`);
    }

    return {
      success: true,
      referralLink: {
        id: referralLink.id,
        code: referralLink.code,
        urlSlug: referralLink.urlSlug,
      },
      partner: {
        id: referralLink.partner.id,
        name: referralLink.partner.name,
      },
      program: {
        id: referralLink.partner.program.id,
        name: referralLink.partner.program.name,
        type: referralLink.partner.program.type,
      },
    };
  }

  /**
   * Record a conversion event
   * This is the main endpoint to call when a referred user completes an action
   */
  async recordConversion(
    partnerId: string,
    amount: number,
    referredUserId?: string,
    metaJson?: any,
  ) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        program: true,
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${partnerId} not found`);
    }

    const conversion = await this.prisma.conversionEvent.create({
      data: {
        programId: partner.programId,
        partnerId,
        referredUserId,
        amount,
        currency: 'USD',
        metaJson,
      },
      include: {
        partner: true,
        program: true,
      },
    });

    return {
      success: true,
      conversion: {
        id: conversion.id,
        amount: conversion.amount,
        currency: conversion.currency,
        occurredAt: conversion.occurredAt,
      },
      partner: {
        id: partner.id,
        name: partner.name,
      },
      program: {
        id: partner.program.id,
        name: partner.program.name,
      },
    };
  }
}
