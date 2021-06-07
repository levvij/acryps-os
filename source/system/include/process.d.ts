// current process instance
declare const process: {
    exit(error?);

    asset(name: string): string;
}

// declare main function
// should be overwritten by your processes main
declare let main: Function;