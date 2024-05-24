import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import fs from 'fs';
import { promisify } from 'util';
import { GlobalGuard } from '~/guards/global/global.guard';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';
import { PublicApiLimiterGuard } from '~/guards/public-api-limiter.guard';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { TelemetryService } from '~/services/telemetry.service';
import { UtilsService } from '~/services/utils.service';

@Controller()
export class UtilsController {
  private version: string;

  constructor(
    protected readonly utilsService: UtilsService,
    protected readonly telemetryService: TelemetryService,
  ) {}

  @UseGuards(PublicApiLimiterGuard)
  @Get('/api/v1/version')
  async getVersion() {
    if (process.env.NC_CLOUD !== 'true') {
      return this.utilsService.versionInfo();
    }

    if (!this.version) {
      try {
        this.version = await promisify(fs.readFile)('./public/nc.txt', 'utf-8');
      } catch {
        this.version = 'Not available';
      }
    }
    return this.version;
  }

  @UseGuards(MetaApiLimiterGuard, GlobalGuard)
  @Post(['/api/v1/db/meta/connection/test', '/api/v2/meta/connection/test'])
  @Acl('testConnection', {
    scope: 'org',
  })
  @HttpCode(200)
  async testConnection(@Body() body: any, @Req() _req: Request) {
    body.pool = {
      min: 0,
      max: 1,
    };

    return await this.utilsService.testConnection({ body });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Get([
    '/api/v1/db/meta/nocodb/info',
    '/api/v2/meta/nocodb/info',
    '/api/v1/meta/nocodb/info',
  ])
  async appInfo(@Req() req: Request) {
    return await this.utilsService.appInfo({
      req: {
        ncSiteUrl: (req as any).ncSiteUrl,
      },
    });
  }

  @Get('/api/v1/health')
  async appHealth() {
    return await this.utilsService.appHealth();
  }

  @UseGuards(PublicApiLimiterGuard)
  @Post(['/api/v1/db/meta/axiosRequestMake', '/api/v2/meta/axiosRequestMake'])
  @HttpCode(200)
  async axiosRequestMake(@Body() body: any) {
    return await this.utilsService.axiosRequestMake({ body });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Post(['/api/v1/setup', '/api/v2/setup'])
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'icon', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
      { name: 'horizontal_logo', maxCount: 1 },
    ]),
  )
  async setup(
    @UploadedFiles()
    files: {
      icon?: Express.Multer.File[];
      logo?: Express.Multer.File[];
      horizontal_logo?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    const icon = files.icon ? files.icon[0] : undefined;
    const logo = files.logo ? files.logo[0] : undefined;
    const horizontal_logo = files.horizontal_logo
      ? files.horizontal_logo[0]
      : undefined;
    return await this.utilsService.setup({ body, icon, logo, horizontal_logo });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Post('/api/v1/url_to_config')
  @HttpCode(200)
  async urlToDbConfig(@Body() body: any) {
    return await this.utilsService.urlToDbConfig({
      body,
    });
  }

  @UseGuards(PublicApiLimiterGuard)
  @Get('/api/v1/aggregated-meta-info')
  async aggregatedMetaInfo() {
    // todo: refactor
    return (await this.utilsService.aggregatedMetaInfo()) as any;
  }
}
