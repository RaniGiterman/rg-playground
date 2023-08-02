window.onload = () => {
    document.getElementById("editor").value = "";
    log("כאן ניתן לצפות בפלט התוכנית");
};

let vars = {};

let inside_if;
let allowed_if;
let in_for_loop;
let arr_for_loop = [];
let condition_with_vars;
let increaser;

document.getElementById("run_code").addEventListener("click", () => {
    document.getElementById("log_list").replaceChildren();
    let code = document.getElementById("editor").value;

    reset_global_vars();
    interpreter(code.split("\n"));
});

// interprete the program line by  line.
function interpreter(lines, done_for_loop) {
    for (let line of lines) {
        line = remove_whitespace(line);
        // console.log(line, inside_if, allowed_if, "INTERPeter")
        // log()


        if (in_for_loop && !done_for_loop) arr_for_loop.push(line);
        if (line == "סיום") return;
        if (line[0] + line[1] + line[2] == "@םא") {
            // if (!allowed_if) continue
            inside_if = false;
        }

        if (inside_if) {
            if (!allowed_if) {
                continue; // inside an if statement, but not allowed to execute code inside.
            }
        }

        if (line.includes("#")) continue; // comment

        else if (line.slice(0, 6) == "@לולאה") {
            let loop_info = line.slice(6);

            // arr[0] is the condition
            // arr[1] is the "increaser"
            let arr = loop_info.split(",");
            increaser = arr[1];
            condition_with_vars = arr[0];

            loop_info = replace_vars(loop_info);
            arr = loop_info.split(",");

            let condition;
            try {
                condition = eval(arr[0]);
            } catch (error) {
                log(error);
            }

            // update_var(arr[1])

            if (condition) in_for_loop = true;
        } else if (line.slice(0, 6) == "@האלול") {
            let temp = replace_vars(increaser);
            update_var(temp);
            // if
            let condition = replace_vars(condition_with_vars);

            try {
                condition = eval(condition);
            } catch (error) {
                return log(error);
            }


            if (condition)
                interpreter(arr_for_loop, true);
        }
        else if (line[0] + line[1] + line[2] == "@אם") {
            // if statement
            // line[3] will always be a space
            // so line[4] until the last index before the end of the line is the condition

            let condition = line.slice(3);
            condition = replace_vars(condition);

            try {
                condition = eval(condition);
            } catch (error) {
                return log(error);
            }

            inside_if = true;
            if (condition) {
                allowed_if = true;
            } else {
                allowed_if = false;
            }
        } else if (line.includes("=")) {
            update_var(line);
        } else if (line.includes("הדפסה")) {
            line = replace_vars(line);
            line = remove_whitespace(line);
            line = line.slice(line.indexOf("(") + 1, line.indexOf(")"));

            log(line);
        }
    }

}

// declaration/update of variable
// left-hand side is the variable name/key
// right-hand side is the value of the variable
function update_var(line) {
    let left = line.split("=")[0];
    let right = line.split("=")[1];

    right = replace_vars(right);

    try {
        right = eval(right);
    } catch (error) {
        return log(error);
    }

    vars[left] = right;
    console.log(vars);
}

// print string to console
function log(str) {
    let li = document.createElement("li");
    li.innerHTML = `${str} <br>`;
    li.style.marginRight = "10px";
    li.classList.add("log_item");
    document.getElementById("log_list").appendChild(li);
}

// UNUSED
function read_from_file(file_path) {
    try {
        const data = fs.readFileSync(file_path, "utf8");
        return { reply: data, err: null };
    } catch (err) {
        return { reply: null, err: err };
    }
}

// remove all whitespaces from string
function remove_whitespace(str) {
    return str.replace(/\s+/g, "");
}

// getting a variable's value by (achieved by putting a $ sign before the name of the variable)
function replace_vars(str) {
    for (const [key, value] of Object.entries(vars)) {
        if (/^\d+$/.test(value))
            str = str.replaceAll("$" + key, value);
        else
            str = str.replaceAll("$" + key, '"' + value + '"');
    }

    return str;
}

// reset variables
function reset_global_vars() {
    vars = {};

    inside_if = null;
    allowed_if = null;
    in_for_loop = null;
    arr_for_loop = [];
    condition_with_vars = null;
    increaser = null;
}