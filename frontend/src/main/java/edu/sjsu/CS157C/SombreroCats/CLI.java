package edu.sjsu.CS157C.SombreroCats;

import org.fusesource.jansi.AnsiConsole;
import org.jline.console.SystemRegistry;
import org.jline.console.impl.SystemRegistryImpl;
import org.jline.reader.*;
import org.jline.reader.impl.DefaultParser;
import org.jline.terminal.Terminal;
import org.jline.terminal.TerminalBuilder;
import org.json.JSONArray;
import org.json.JSONObject;
import picocli.CommandLine;
import picocli.CommandLine.Option;
import picocli.CommandLine.Command;
import picocli.CommandLine.Parameters;
import picocli.CommandLine.ParentCommand;
import picocli.shell.jline3.PicocliCommands;
import picocli.shell.jline3.PicocliCommands.PicocliCommandsFactory;

import java.io.*;
import java.math.BigDecimal;
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

    private static String fetchURL = "http://localhost:8080/";

    /**
     * Top-level command that just prints help.
     */
    @Command(name = "",
            description = {"h"},
            footer = {"", "Press Ctrl-D to exit."},
            //add commands here as {command}.class
            subcommands = {
                    get.class,
                    stats.class,
                    test.class,
                    //CommandLine.HelpCommand.class
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

    /**
     * Gets a random review. Takes in no input.
     */
    @Command(name = "testReview", mixinStandardHelpOptions = false, version = "1.0",
            description = {"get a random review, used to test db connection."})
    static class test implements Runnable {

        @ParentCommand CliCommands parent;

        @Option(names = {"-h", "--help"}, usageHelp = true,description = "Display this help and exit")
        private boolean help;

        public void run()  {
            String req = getRequest("review");
            JSONObject jsonReview = new JSONObject(req);
            printReview(jsonReview);
        }
    }

    /**
     * a list of preset requests
     */
    @Command(name = "get", mixinStandardHelpOptions = false, version = "1.0",
            description = "choose one of the presets to retrieve.")
    static class get implements Runnable {
        @Parameters(index = "0", description = "The preset to retrieve. Options include:\n" +
                "bestRated\n" +
                "worstRated\n" +
                "littleKnown\n" +
                "mostReviews\n" +
                "funniestReview\n" +
                "mostHighRatings")
        private String preset;

        @Option(names = {"-h", "--help"}, usageHelp = true,description = "Display this help and exit")
        private boolean help;

        @ParentCommand
        CliCommands parent;

        public void run() {
            String obj;
            JSONObject jsonObj = null;
            switch (preset) {
                case "bestRated":
                    obj = getRequest("bestRated");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    break;
                case "worstRated":
                    obj = getRequest("worstRated");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    break;
                case "mostReviews":
                    obj = getRequest("restaurants/most/reviews");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    break;
                case "littleKnown":
                    obj = getRequest("littleKnown");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    break;
                case "funniestReview":
                    obj = getRequest("funniestReview");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    break;
//                case "mostHighRatings":
//                    String restID = (String) new JSONArray(getRequest("most4and5stars")).getJSONObject(0).get("_id");
//                    obj = getRequest()
//                    jsonObj = new JSONArray(obj).getJSONObject(0);
//                    break;
                default:
                    obj = "no match";
            }
            if(obj == "no match"){
                System.out.println("No match found for that argument! Try again.");
                return;
            }
            if(jsonObj.has("name")) {
                printRest(jsonObj);
            }
            else {
                printReview(jsonObj);
            }
        }
    }

    /**
     * gets stats about the database. Takes a little longer than get.
     */
    @Command(name = "stats", mixinStandardHelpOptions = false, version = "1.0",
            description = "choose one of the stats about the review db. CAN TAKE UP TO A MINUTE!")
    static class stats implements Runnable {

        @Parameters(index = "0", description = "The stat to retrieve. Options include:\n" +
                "avgReviewLength\n" +
                "averageRating\n" +
                "totalUniqueUsers\n" +
                "userSentiment\n")
        private String stat;

        @Option(names = {"-h", "--help"}, usageHelp = true,description = "Display this help and exit")
        private boolean help;

        @ParentCommand
        CliCommands parent;

        public void run() {
            String obj;
            JSONObject jsonObj = null;
            switch (stat) {
                case "avgReviewLength":
                    obj = getRequest("avgReviewLength");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    //what a mouthful! Really just convert bigDec to double, and then round it
                    System.out.println("Average Length of a review: " + Math.round(((BigDecimal) jsonObj.get("avgLength")).doubleValue()*100.0)/100.0);
                    return;
                case "averageRating":
                    obj = getRequest("avgReviews");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    System.out.println("Average rating of a restaurant: " + Math.round(((BigDecimal) jsonObj.get("avg_rating")).doubleValue()*100.0)/100.0);
                    return;
                case "totalUniqueUsers":
                    obj = getRequest("totalUniqueUsers");
                    jsonObj = new JSONArray(obj).getJSONObject(0);
                    System.out.println("total unique users: " + jsonObj.get("total"));
                    return;
//                case "userSentiment":
//                    obj = getRequest("avgReviews");
//                    jsonObj = new JSONArray(obj).getJSONObject(0);
//                    System.out.println("Average rating of a restaurant: " + Math.round(((BigDecimal) jsonObj.get("avg_rating")).doubleValue()*100.0)/100.0);
//                    return;
            }
            System.out.println("No match found, sorry! : (");
        }
    }

    private static String getRequest(String req) {
        URL url = null;
        try {
            url = new URL(fetchURL+req);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            //30 sec timeout
            con.setConnectTimeout(60000);
            con.setReadTimeout(60000);
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

    private static void printRest(JSONObject rest){
        System.out.println(
                "stars: " +rest.get("name") + "\n" +
                        "address: " + rest.get("address") + "\n" +
                        "city: " + rest.get("city") + "\n" +
                        "state: " + rest.get("state") + "\n" +
                        "avg stars: " + rest.get("stars") + "\n" +
                        "review_count: " + rest.get("review_count")
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