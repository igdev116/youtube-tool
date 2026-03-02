import { Model, Types } from 'mongoose';
import { TelegramGroup, TelegramGroupDocument } from './telegram-group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { YoutubeChannelDocument } from '../modules/youtube-channel/youtube-channel.schema';
export declare class TelegramGroupService {
    private readonly groupModel;
    private readonly channelModel;
    constructor(groupModel: Model<TelegramGroupDocument>, channelModel: Model<YoutubeChannelDocument>);
    createGroup(userId: string, dto: CreateGroupDto): Promise<import("mongoose").Document<unknown, {}, TelegramGroupDocument, {}> & TelegramGroup & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getUserGroups(userId: string): Promise<{
        channelCount: any;
        name: string;
        groupId: string;
        botToken: string;
        user: Types.ObjectId | import("mongoose").FlattenMaps<import("../user/user.schema").User>;
        _id: import("mongoose").FlattenMaps<unknown>;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths> | undefined) => Omit<TelegramGroupDocument, keyof Paths> & Paths;
        $clearModifiedPaths: () => TelegramGroupDocument;
        $clone: () => TelegramGroupDocument;
        $createModifiedPathsSnapshot: () => import("mongoose").ModifiedPathsSnapshot;
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path?: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => TelegramGroupDocument;
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}> & {
                _id: Types.ObjectId;
            } & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $restoreModifiedPathsSnapshot: (snapshot: import("mongoose").ModifiedPathsSnapshot) => TelegramGroupDocument;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): TelegramGroupDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): TelegramGroupDocument;
            (value: string | Record<string, any>): TelegramGroupDocument;
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string | undefined;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => any;
        depopulate: <Paths = {}>(path?: string | string[]) => import("mongoose").MergeType<TelegramGroupDocument, Paths>;
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any, Record<string, any>>) => boolean;
        errors?: import("mongoose").Error.ValidationError | undefined;
        get: {
            <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<TelegramGroupDocument>;
        id?: any;
        increment: () => TelegramGroupDocument;
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => TelegramGroupDocument;
        invalidate: {
            <T extends string | number | symbol>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends string | number | symbol>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends string | number | symbol>(path?: T | T[] | undefined, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends string | number | symbol>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}> & {
                _id: Types.ObjectId;
            } & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => TelegramGroupDocument;
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<TelegramGroupDocument, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<TelegramGroupDocument, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, TelegramGroupDocument, {}, unknown, "find", Record<string, never>>;
        save: (options?: import("mongoose").SaveOptions) => Promise<TelegramGroupDocument>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: unknown;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: unknown;
        }>, {}> & import("mongoose").FlatRecord<{
            [x: string]: unknown;
        }> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }>>;
        set: {
            <T extends string | number | symbol>(path: T, val: any, type: any, options?: import("mongoose").DocumentSetOptions): TelegramGroupDocument;
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): TelegramGroupDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): TelegramGroupDocument;
            (value: string | Record<string, any>): TelegramGroupDocument;
        };
        toJSON: {
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): {
                [x: string]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): any;
            <T = any>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<import("mongoose").FlattenMaps<T>>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<T>;
        };
        toObject: {
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options?: import("mongoose").ToObjectOptions): any;
            <T>(options?: import("mongoose").ToObjectOptions): import("mongoose").Default__v<import("mongoose").Require_id<T>>;
        };
        unmarkModified: {
            <T extends string | number | symbol>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<TelegramGroupDocument> | undefined, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, TelegramGroupDocument, {}, unknown, "find", Record<string, never>>;
        validate: {
            <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): Promise<void>;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
            }): Promise<void>;
        };
        validateSync: {
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
                [k: string]: any;
            }): import("mongoose").Error.ValidationError | null;
            <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        __v: number;
    }[]>;
    getGroupById(userId: string, groupId: string): Promise<import("mongoose").FlattenMaps<TelegramGroupDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    updateGroup(userId: string, groupId: string, dto: UpdateGroupDto): Promise<import("mongoose").Document<unknown, {}, TelegramGroupDocument, {}> & TelegramGroup & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteGroup(userId: string, groupId: string): Promise<{
        success: boolean;
    }>;
    getGroupChannels(userId: string, groupId: string): Promise<(import("mongoose").FlattenMaps<YoutubeChannelDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    getGroupsByChannelId(userId: Types.ObjectId, channelId: string): Promise<TelegramGroup[]>;
}
