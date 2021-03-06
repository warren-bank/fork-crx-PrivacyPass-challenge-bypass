import { Storage } from '../storage';
import qs from 'qs';

export interface Callbacks {
    updateIcon(text: string): void;
    navigateUrl(url: string): void;
}

export interface EarnedTokenCookie {
   url:    string;
   domain: string;
   name:   string;
}

export abstract class Provider {
    static readonly TOKEN_STORE_KEY: string = 'tokens';

    static readonly ID: number;
    static readonly EARNED_TOKEN_COOKIE: EarnedTokenCookie | void;

    constructor(_storage: Storage, _callbacks: Callbacks){}

    abstract forceUpdateIcon(): void;
    abstract handleActivated(): void;
    abstract handleBeforeRequest(
        details: chrome.webRequest.WebRequestBodyDetails,
    ): chrome.webRequest.BlockingResponse | void;
    abstract handleHeadersReceived(
        details: chrome.webRequest.WebResponseHeadersDetails,
    ): chrome.webRequest.BlockingResponse | void;
    abstract handleBeforeSendHeaders(
        details: chrome.webRequest.WebRequestHeadersDetails,
    ): chrome.webRequest.BlockingResponse | void;
    abstract handleOnCompleted(
        details: chrome.webRequest.WebResponseHeadersDetails,
    ): void;
    abstract handleOnErrorOccurred(
        details: chrome.webRequest.WebResponseErrorDetails,
    ): void;
}

// -----------------------------------------------------------------------------
// static methods

interface QUALIFIED_STRING {
    exact?:    string[];
    contains?: string[];
}

export type QUALIFIED_HOSTNAMES = QUALIFIED_STRING;
export type QUALIFIED_PATHNAMES = QUALIFIED_STRING;

export interface QUALIFIED_PARAMS {
    some?:  string[];
    every?: string[];
}

function isQualifiedStringFound(haystack: QUALIFIED_STRING | void, needle: string, result_empty_haystack: boolean = true): boolean {
    let empty = true;
    let found = false;

    if (haystack instanceof Object) {
        if (!found && Array.isArray(haystack.exact) && haystack.exact.length) {
            empty = false;
            found = (haystack.exact.indexOf(needle) >= 0);
        }
        if (!found && Array.isArray(haystack.contains) && haystack.contains.length) {
            empty = false;
            found = haystack.contains.some(part => (needle.indexOf(part) >= 0));
        }
    }

    return empty ? result_empty_haystack : found;
}

export function isIssuingHostname(hostnames: QUALIFIED_HOSTNAMES | void, url: URL): boolean {
    const hostname = url.host.toLowerCase();
    return isQualifiedStringFound(hostnames, hostname, false);
}

export function isQualifiedPathname(pathnames: QUALIFIED_PATHNAMES | void, url: URL): boolean {
    const pathname = url.pathname.toLowerCase();
    return isQualifiedStringFound(pathnames, pathname, true);
}

function areQualifiedParamsFound(params: QUALIFIED_PARAMS | void, test: (param: string) => boolean, result_empty_haystack: boolean = true): boolean {
    let empty = true;
    let found = false;

    if (params instanceof Object) {
        if (!found && Array.isArray(params.some) && params.some.length) {
            empty = false;
            found = params.some.some(test);
        }
        if (!found && Array.isArray(params.every) && params.every.length) {
            empty = false;
            found = params.every.every(test);
        }
    }

    return empty ? result_empty_haystack : found;
}

function isQualifiedQueryParam(url: URL, param: string): boolean {
    let [param_name, param_value] = param.split('=', 2);
    let param_exact: boolean = true;
    if (param_value) {
        if (param_name[param_name.length - 1] === '!') {
            param_exact = false;
            param_name  = param_name.substring(0, param_name.length - 1);
        }
    }

    if (!url.searchParams.has(param_name)) return false;

    if (param_value) {
        const actual_value: string | null = url.searchParams.get(param_name);

        return param_exact
            ? (actual_value! === param_value)
            : (actual_value! !== param_value)
        ;
    }
    else {
        return true;
    }
}

export function areQualifiedQueryParams(params: QUALIFIED_PARAMS | void, url: URL): boolean {
    const test: (param: string) => boolean = isQualifiedQueryParam.bind(null, url);
    return areQualifiedParamsFound(params, test, true);
}

function isQualifiedBodyFormParam(formData: { [key: string]: string[] | string } | void, param: string): boolean {
    if (!(formData instanceof Object)) return false;

    let [param_name, param_value] = param.split('=', 2);
    let param_exact: boolean = true;
    if (param_value) {
        if (param_name[param_name.length - 1] === '!') {
            param_exact = false;
            param_name  = param_name.substring(0, param_name.length - 1);
        }
    }

    if (!(param_name in formData)) return false;

    if (param_value) {
        const actual_value: string | string[] = formData[param_name];

        if (Array.isArray(actual_value)) {
            const isInArray: boolean = (actual_value.indexOf(param_value) !== -1);

            return param_exact
                ? isInArray
                : !isInArray
            ;
        }
        else {
            return param_exact
                ? (actual_value === param_value)
                : (actual_value !== param_value)
            ;
        }
    }
    else {
        return true;
    }
}

export function areQualifiedBodyFormParams(params: QUALIFIED_PARAMS | void, formData: { [key: string]: string[] | string } | void): boolean {
    const test: (param: string) => boolean = isQualifiedBodyFormParam.bind(null, formData);
    return areQualifiedParamsFound(params, test, true);
}

export function getNormalizedFormData(
    details: chrome.webRequest.WebRequestBodyDetails,
    flatten: boolean = false,
): { [key: string]: string[] | string } {
    let formData: { [key: string]: string[] | string } = {};

    if (details.requestBody instanceof Object) {
        if (details.requestBody.formData instanceof Object) {
            formData = details.requestBody.formData;
        }
        else if (Array.isArray(details.requestBody.raw) && (details.requestBody.raw.length > 0)) {
            try {
                const decodedData = details.requestBody.raw.map(val => (val && val.bytes) ? new TextDecoder().decode(new Uint8Array(val.bytes!)) : '').join('');
                let isParsed: boolean = false;

                if (!isParsed) {
                    // content-type: application/x-www-form-urlencoded
                    try {
                        const parsedData: any  = qs.parse(decodedData);

                        if ((parsedData !== undefined) && (parsedData instanceof Object)) {
                            isParsed = true;
                            formData = parsedData;
                        }
                    }
                    catch(e1) {}
                }

                if (!isParsed) {
                    // content-type: application/json
                    try {
                        const parsedData: any  = JSON.parse(decodedData);

                        if ((parsedData !== undefined) && (parsedData instanceof Object)) {
                            formData = parsedData;
                        }
                    }
                    catch(e2) {}
                }
            }
            catch(error) {}
        }
    }

    if (flatten) {
        for (const key in formData) {
            if (
                Array.isArray(formData[key]) &&
                (formData[key].length === 1)
            ) {
                formData[key] = formData[key][0];
            }
        }
    }

    return formData;
}
