package edu.sjsu.CS157C.SombreroCats;

import org.fusesource.jansi.AnsiConsole;
import org.jline.console.SystemRegistry;
import org.jline.console.impl.SystemRegistryImpl;
import org.jline.reader.*;
import org.jline.reader.impl.DefaultParser;
import org.jline.terminal.Terminal;
import org.jline.terminal.TerminalBuilder;
import org.json.JSONObject;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Parameters;
import picocli.CommandLine.ParentCommand;
import picocli.shell.jline3.PicocliCommands;
import picocli.shell.jline3.PicocliCommands.PicocliCommandsFactory;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.function.Supplier;

/**
 * JLine + PicoCLI mini-app using a boilerplate:
 * https://github.com/remkop/picocli/blob/main/picocli-shell-jline3/README.md
 * <p>
 * The built-in {@code PicocliCommands.ClearScreen} command was introduced in picocli 4.6.
 * </p>
 */

public class CLI {

    /**
     * Top-level command that just prints help.
     * Add commands here as we develop
     */
    @Command(name = "",
            description = {"h"},
            footer = {"", "Press Ctrl-D to exit."},
            //add commands here as {command}.class
            subcommands = {
                    preset.class,
                    random.class,
                    PicocliCommands.ClearScreen.class,
                    CommandLine.HelpCommand.class
            })
    static class CliCommands implements Runnable {
        PrintWriter out;

        CliCommands() {}

        public void setReader(LineReader reader){
            out = reader.getTerminal().writer();
        }

        public void run() {
            out.println(new CommandLine(this).getUsageMessage());
        }
    }

//    /**
//     * A command to query the db
//     */
//    @Command(name = "query", mixinStandardHelpOptions = true, version = "1.0",
//            description = {"perform a query in mongo syntax to the db."},
//            subcommands = {CommandLine.HelpCommand.class})
//    static class query implements Runnable {
//
//        @ParentCommand CliCommands parent;
//// Example option:
////        @Option(names = {"-h", "--host"}, defaultValue = "localhost",
////                description = "host of db to connect to")
////        private String host;
//
//
//        public void run() {}
//    }

    /**
     * Gets a random review. Takes in no input.
     */
    @Command(name = "randReview", mixinStandardHelpOptions = true, version = "1.0",
            description = {"get a random review."},
            subcommands = {CommandLine.HelpCommand.class})
    static class random implements Runnable {

        @ParentCommand CliCommands parent;

        public void run()  {
            String req = getRequest("http://localhost:8080/review");
            JSONObject jsonReview = new JSONObject(req);
            printReview(jsonReview);
        }
    }

    /**
     * a list of preset requests
     */
    @Command(name = "presetReview", mixinStandardHelpOptions = true, version = "1.0",
            description = {"choose one of the presets to retrieve.",
                    "Format: preset -n <i>"},
            subcommands = {CommandLine.HelpCommand.class})
    static class preset implements Runnable {

        @Parameters(index = "0", description = "The preset to retrieve. Options include:\n" +
                "xyz\n" +
                "abc\n")
        private String opt;

        @ParentCommand
        CliCommands parent;

        public void run() {

        }
    }

    private static String getRequest(String req) {
        URL url = null;
        try {
            url = new URL(req);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            con.setConnectTimeout(1000);
            con.setReadTimeout(1000);
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine = in.readLine();
            in.close();
            con.disconnect();
            return inputLine;
        } catch (IOException e) {
            System.out.println("Unable to parse request " + req + ". Is the backend up and have reviews been imported yet?\nExiting.");
            System.exit(-1);
        }
        return null;
    }

    private static void printReview(JSONObject review){
        System.out.println(
                "stars: " +review.get("stars") + "\n" +
                        "text: " + review.get("text") + "\n" +
                        "date: " + review.get("date") + "\n" +
                        "useful: " + review.get("useful") + "\n" +
                        "funny: " + review.get("funny") + "\n" +
                        "cool: " + review.get("cool")
        );
    }

    /**
     * Runnable for Yelp interpreter
     * @param args
     */
    public static void main(String[] args) {
        AnsiConsole.systemInstall();
        try {
            Supplier<Path> workDir = () -> Paths.get(System.getProperty("user.dir"));
            CliCommands commands = new CliCommands();

            PicocliCommandsFactory factory = new PicocliCommandsFactory();
            // Or, if you have your own factory, you can chain them like this:
            // MyCustomFactory customFactory = createCustomFactory(); // your application custom factory
            // PicocliCommandsFactory factory = new PicocliCommandsFactory(customFactory); // chain the factories

            CommandLine cmd = new CommandLine(commands, factory);
            PicocliCommands picocliCommands = new PicocliCommands(cmd);

            Parser parser = new DefaultParser();
            try (Terminal terminal = TerminalBuilder.builder().build()) {
                SystemRegistry systemRegistry = new SystemRegistryImpl(parser, terminal, workDir, null);
                systemRegistry.setCommandRegistries(picocliCommands);
                systemRegistry.register("help", picocliCommands);

                LineReader reader = LineReaderBuilder.builder()
                        .terminal(terminal)
                        .completer(systemRegistry.completer())
                        .parser(parser)
                        .variable(LineReader.LIST_MAX, 50)   // max tab completion candidates
                        .build();
                commands.setReader(reader);
                factory.setTerminal(terminal);
                String prompt = "Yelper> ";
                String rightPrompt = null;

                System.out.println(" _     _       _                    \n" +
                        "| |   | |     | |                   \n" +
                        "| |___| |_____| | ____  _____  ____ \n" +
                        "|_____  | ___ | ||  _ \\| ___ |/ ___)\n" +
                        " _____| | ____| || |_| | ____| |    \n" +
                        "(_______|_____)\\_)  __/|_____)_|    \n" +
                        "                 |_|    ");
                // start the shell and process input until the user quits with Ctrl-D
                String line;
                while (true) {
                    try {
                        systemRegistry.cleanUp();
                        line = reader.readLine(prompt, rightPrompt, (MaskingCallback) null, null);
                        systemRegistry.execute(line);
                    } catch (UserInterruptException e) {
                        // Ignore
                    } catch (EndOfFileException e) {
                        return;
                    } catch (Exception e) {
                        systemRegistry.trace(e);
                    }
                }
            }
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            AnsiConsole.systemUninstall();
        }
    }
}